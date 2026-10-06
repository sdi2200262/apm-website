# Builds the site's diagrams into static/img/diagrams/ as <name>[-<variant>]-<theme>.svg, theme light or dark.
# Run: python3 scripts/build-diagrams.py   (needs the `drawio` and `d2` CLIs on PATH, and network for the font)
# Sources, in diagrams/:
# - Coded here (icons from diagrams/icons/): the overview (landing page, Introduction; desktop()/phone(), one
#   SVG per highlight plus -phone, adapted from the thesis deck's gen.py) and the thesis's Message Bus, state
#   compression and Handoff (FIGURES, each with -phone). Edit the layout functions, not the SVGs.
# - Re-themed from the thesis: diagrams/drawio/*.drawio (restyle()) and diagrams/d2/*.d2 (d2_svg()). Edit the
#   sources' layout and wording there, not their colours or fonts; one SVG per theme, no phone layout.
# Pipeline: draw.io XML -> the drawio CLI exports SVG -> font_css() inlines a Literata subset so the SVG
# renders right inside an <img> (HTML labels included). d2 embeds its own font subset from the TTFs fetched by literata_ttf().
import base64
import html
import os
import re
import subprocess
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'diagrams')
OUT = os.path.join(ROOT, 'static', 'img', 'diagrams')
# Book colours (Gruvbox), kept in sync with --apm-ink/-paper/-deep in src/css/custom.css.
THEMES = {'light': {'ink': '#3C3836', 'paper': '#FBF1C7', 'deep': '#EBDBB2'},
          'dark': {'ink': '#EBDBB2', 'paper': '#282828', 'deep': '#3C3836'}}
PARTS = (None, 'planning', 'implementation', 'state', 'user')  # None = no highlight
FADE = 'opacity=20;textOpacity=20;'  # appended to a cell's style to dim it
FONT = 'Literata'


class D:
    """Minimal draw.io writer. Each method appends one mxCell and returns its id, so edges can
    refer to the cells they join. Coordinates are cell centres; draw.io routes the edges."""

    def __init__(self, w, h, t, fs, isz=30):
        # w, h: page size; t: theme colours; fs: font size; isz: icon size.
        self.cells, self.n, self.w, self.h, self.t, self.isz = [], 2, w, h, t, isz
        self.base = f"fontFamily={FONT};fontSize={fs};fontColor={t['ink']};strokeColor={t['ink']};"

    def id(self):
        # Ids 0 and 1 are draw.io's root and default layer.
        self.n += 1
        return f'c{self.n}'

    def add(self, label, style, geo, **attrs):
        # Appends a cell with the shared base style; attrs become XML attributes (vertex, edge, source, target).
        i = self.id()
        a = ' '.join(f'{k}="{v}"' for k, v in attrs.items())
        self.cells.append(f'<mxCell id="{i}" value="{html.escape(label).replace(chr(10), '&#xa;')}" style="{self.base}{style}" {a} parent="1">{geo}</mxCell>')
        return i

    def icon(self, name, x, y, label, fade=False):
        # A Lucide icon from diagrams/icons/<name>.svg, recoloured to ink and embedded, with its label below.
        size = self.isz
        svg = open(os.path.join(SRC, 'icons', name + '.svg')).read().replace('currentColor', self.t['ink'])
        img = base64.b64encode(svg.encode()).decode()
        st = f"shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=data:image/svg+xml,{img};" + FADE * fade
        return self.add(label, st, f'<mxGeometry x="{x-size/2}" y="{y-size/2}" width="{size}" height="{size}" as="geometry"/>', vertex=1)

    def text(self, x, y, w, label, fade=False, italic=True):
        # A free-standing label, w wide: italic for phase titles, upright for edge labels.
        st = f'text;html=0;align=center;verticalAlign=middle;fontStyle={2 if italic else 0};' + FADE * fade
        return self.add(label, st, f'<mxGeometry x="{x-w/2}" y="{y-10}" width="{w}" height="20" as="geometry"/>', vertex=1)

    def point(self, x, y):
        # An invisible zero-size cell, used as an edge end where no shape sits (e.g. just under a label).
        return self.add('', 'text;html=0;', f'<mxGeometry x="{x}" y="{y}" width="0" height="0" as="geometry"/>', vertex=1)

    def edge(self, a, b, ex=None, en=None, line=False, dashed=False, both=False, fade=False, wp=()):
        # Orthogonal edge from cell a to cell b. ex/en: exit/entry point as (x, y) fractions of the shape
        # (1, .5 = middle of the right side). line: no arrowhead; both: arrowheads at both ends; wp: waypoints.
        st = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endSize=5;startSize=5;'
        if ex:
            st += f'exitX={ex[0]};exitY={ex[1]};exitDx=0;exitDy=0;'
        if en:
            st += f'entryX={en[0]};entryY={en[1]};entryDx=0;entryDy=0;'
        if dashed:
            st += 'dashed=1;dashPattern=8 8;'
        if line:
            st += 'endArrow=none;'  # a dashed link to a file, not a message
        if both:
            st += 'startArrow=classic;startFill=1;'
        pts = ''.join(f'<mxPoint x="{x}" y="{y}"/>' for x, y in wp)
        geo = '<mxGeometry relative="1" as="geometry">' + (f'<Array as="points">{pts}</Array>' if pts else '') + '</mxGeometry>'
        return self.add('', st + FADE * fade, geo, edge=1, source=a, target=b)

    def xml(self):
        # The whole diagram as a .drawio file.
        return (f'<mxfile><diagram name="p" id="p"><mxGraphModel pageWidth="{self.w}" pageHeight="{self.h}"><root>'
                '<mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(self.cells) + '</root></mxGraphModel></diagram></mxfile>')


def fades(hl):
    # Which groups fade when `hl` is highlighted: P/I planning/implementation agents, PS/IS their files,
    # U the users and relays, H the Planning-to-Implementation arrow. Phase maps keep their own files.
    return dict(P=hl not in (None, 'planning'), I=hl not in (None, 'implementation'),
                PS=hl not in (None, 'planning', 'state'), IS=hl not in (None, 'implementation', 'state'),
                U=hl not in (None, 'user'), H=hl is not None and hl != 'user')


def desktop(t, hl):
    # Landscape, 720 wide: one row of agents and users, the Message Bus above, the files below.
    f, d = fades(hl), D(720, 260, t, 9)
    S = 150
    X = [60 + S * k for k in range(5)]  # columns: planner, user, manager, user, workers
    BY, Y = 50, 140  # row y's: message bus, agents
    LY, FY = Y + 34, Y + 95  # just below an agent's label, files
    d.text((X[0] + X[1]) / 2, 0, 200, 'Planning Phase', f['P'])
    d.text(X[3], 0, 200, 'Implementation Phase', f['I'])
    pl = d.icon('bot', X[0], Y, 'Planner', f['P'])
    u1 = d.icon('user', X[1], Y, 'User', f['P'] and f['U'])
    ma = d.icon('bot', X[2], Y, 'Manager', f['I'])
    u2 = d.icon('user', X[3], Y, 'User', f['I'] and f['U'])
    wo = d.icon('bot', X[4], Y, 'Workers', f['I'])
    d.edge(pl, u1, (1, .5), (0, .5), both=True, fade=f['P'] and f['U'])
    d.edge(u1, ma, (1, .5), (0, .5), dashed=True, fade=f['H'])  # hand-off from Planning to Implementation
    d.edge(ma, u2, (1, .5), (0, .5), both=True, fade=f['I'] and f['U'])
    d.edge(u2, wo, (1, .5), (0, .5), both=True, fade=f['I'] and f['U'])
    sp = d.icon('file-cog', (X[0] + X[1]) / 2, FY, 'Spec, Plan, Rules', f['PS'])
    d.edge(d.point(X[0], LY), sp, en=(0, .5), line=True, dashed=True, fade=f['PS'], wp=[(X[0], FY)])
    d.edge(d.point(X[1], LY), sp, en=(1, .5), line=True, dashed=True, fade=f['PS'], wp=[(X[1], FY)])
    bus = d.icon('inbox', X[3], BY, 'Message Bus', f['IS'] and f['U'])
    d.edge(ma, bus, (.5, 0), (0, .5), line=True, dashed=True, fade=f['IS'])
    d.edge(wo, bus, (.5, 0), (1, .5), line=True, dashed=True, fade=f['IS'])
    d.edge(u2, d.point(X[3], BY + 34), (.5, 0), line=True, dashed=True, fade=f['IS'] and f['U'])
    tr = d.icon('file-chart-column-increasing', (X[2] + X[3]) / 2, FY, 'Tracker', f['IS'])
    me = d.icon('folder-tree', (X[3] + X[4]) / 2, FY, 'Memory', f['IS'])
    d.edge(d.point(X[2], LY), tr, en=(0, .5), line=True, dashed=True, fade=f['IS'], wp=[(X[2], FY)])
    d.edge(tr, me, (1, .5), (0, .5), line=True, dashed=True, fade=f['IS'])
    d.edge(d.point(X[4], LY), me, en=(1, .5), line=True, dashed=True, fade=f['IS'], wp=[(X[4], FY)])
    return d


def phone(t):
    # Portrait, 342 wide: Planning above Implementation, the hand-off down the right side.
    # Implementation runs right to left so the Manager sits under the Planning User. No highlights.
    # Row y's: phase titles T1/T2, agents A/IM, files S/F, message bus B. LB = icon centre to just below its label.
    T1, A, S, T2, B, IM, F, LB = 0, 60, 150, 250, 305, 405, 500, 40
    d = D(342, F + 30, t, 13, 34)
    L, M, R = 44, 171, 286  # columns: left, middle, right
    d.text(M, T1, 300, 'Planning Phase')
    pl = d.icon('bot', L, A, 'Planner')
    u1 = d.icon('user', R, A, 'User')
    d.edge(pl, u1, (1, .5), (0, .5), both=True)
    sp = d.icon('file-cog', M, S, 'Spec, Plan, Rules')
    d.edge(d.point(L, A + LB), sp, en=(0, .5), line=True, dashed=True, wp=[(L, S)])
    d.edge(d.point(R, A + LB), sp, en=(1, .5), line=True, dashed=True, wp=[(R, S)])
    d.text(M, T2, 300, 'Implementation Phase')
    bus = d.icon('inbox', M, B, 'Message Bus')
    wo = d.icon('bot', L, IM, 'Workers')
    u2 = d.icon('user', M, IM, 'User')
    ma = d.icon('bot', R, IM, 'Manager')
    d.edge(u1, ma, (1, .5), (1, .5), dashed=True, wp=[(330, A), (330, IM)])
    d.edge(ma, u2, (0, .5), (1, .5), both=True)
    d.edge(u2, wo, (0, .5), (1, .5), both=True)
    d.edge(ma, bus, (.5, 0), (1, .5), line=True, dashed=True)
    d.edge(wo, bus, (.5, 0), (0, .5), line=True, dashed=True)
    d.edge(u2, d.point(M, B + LB), (.5, 0), line=True, dashed=True)
    me = d.icon('folder-tree', (L + M) / 2, F, 'Memory')
    tr = d.icon('file-chart-column-increasing', (M + R) / 2, F, 'Tracker')
    d.edge(d.point(L, IM + LB), me, en=(0, .5), line=True, dashed=True, wp=[(L, F)])
    d.edge(me, tr, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(d.point(R, IM + LB), tr, en=(1, .5), line=True, dashed=True, wp=[(R, F)])
    return d


# The figures below follow the overview's conventions: agents and files are labelled icons, solid arrows
# carry a message or a write, dashed lines tie the User to what they mediate (or a file to what holds it).
# Edge labels sit beside their line, never on it, mirrored above/below (or left/right) for symmetry.
# Desktop: 9pt text, 30px icons, LB = icon centre to just below a one-line label; a 30px icon's .25/.75
# exits sit 7.5px either side of its centre. Phone: 13pt, 34px icons, labels inside the column gaps.

def note(d, x, y, label, w=120):
    return d.text(x, y, w, label, italic=False)


def message_bus(t):
    # Three channels between Manager and Worker: the Task Bus above carries Task Prompts left to right,
    # the User in the middle (dashed: they carry every message), the Report Bus below carries Task
    # Reports back. Both buses are dashed to the User. Symmetric about both axes.
    d, LB = D(600, 230, t, 9), 34
    L, M, R = 40, 300, 560  # columns: Manager, buses and User, Worker
    E1, E2 = (L + M) / 2, (M + R) / 2  # elbow columns
    T, A, B = 30, 110, 190  # rows: Task Bus, agents and User, Report Bus
    ma, us, wo = d.icon('bot', L, A, 'Manager'), d.icon('user', M, A, 'User'), d.icon('bot', R, A, 'Worker')
    tb, rb = d.icon('file-input', M, T, 'Task Bus'), d.icon('file-output', M, B, 'Report Bus')
    d.edge(ma, tb, (1, .2), (0, .5), wp=[(E1, A - 9), (E1, T)])
    d.edge(tb, wo, (1, .5), (0, .2), wp=[(E2, T), (E2, A - 9)])
    d.edge(wo, rb, (0, .8), (1, .5), wp=[(E2, A + 9), (E2, B)])
    d.edge(rb, ma, (0, .5), (1, .8), wp=[(E1, B), (E1, A + 9)])
    d.edge(ma, us, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(us, wo, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(d.point(M, T + LB), us, en=(.5, 0), line=True, dashed=True)
    d.edge(d.point(M, A + LB), rb, en=(.5, 0), line=True, dashed=True)
    for x, a, b in ((E1 + M - 15, 'Writes to', 'Read by'), (E2 + M + 15, 'Read by', 'Writes to')):
        note(d, x / 2, T - 8, a)
        note(d, x / 2, B + 8, b)
    return d


def message_bus_phone(t):
    # The landscape figure turned a quarter: Manager on top, Worker below, the Task Bus down the left,
    # the Report Bus up the right, the User's dashed channel down the middle.
    d, LB = D(342, 420, t, 13, 34), 40
    L, M, R = 60, 171, 282  # columns: Task Bus, Manager/User/Worker, Report Bus
    A, U, W = 30, 200, 370  # rows: Manager, buses and User, Worker
    ma, us, wo = d.icon('bot', M, A, 'Manager'), d.icon('user', M, U, 'User'), d.icon('bot', M, W, 'Worker')
    tb, rb = d.icon('file-input', L, U, 'Task Bus'), d.icon('file-output', R, U, 'Report Bus')
    d.edge(ma, tb, (0, .5), (.5, 0), wp=[(L, A)])
    d.edge(d.point(L, U + LB), wo, en=(0, .5), wp=[(L, W)])
    d.edge(wo, d.point(R, U + LB), (1, .5), wp=[(R, W)])
    d.edge(rb, ma, (.5, 0), (1, .5), wp=[(R, A)])
    d.edge(us, tb, (0, .5), (1, .5), line=True, dashed=True)
    d.edge(us, rb, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(d.point(M, A + LB), us, en=(.5, 0), line=True, dashed=True)
    d.edge(d.point(M, U + LB), wo, en=(.5, 0), line=True, dashed=True)
    for y, a, b in (((A + U) / 2, 'Writes to', 'Read by'), ((U + LB + W) / 2, 'Read by', 'Writes to')):
        note(d, L + 38, y, a)
        note(d, R - 38, y, b)
    return d


def state_compression(t):
    # Execution detail (top) and coordination detail (bottom) are each recorded, then condensed into the
    # Index, which is part of Memory. Symmetric about the middle row.
    d = D(640, 200, t, 9)
    X0, X1, E, XI, XM = 40, 200, 420, 520, 600  # columns: detail, records, elbow, Index, Memory
    T, C, B = 30, 100, 170  # rows: execution, Index, coordination
    ex, co = d.icon('boxes', X0, T, 'Execution detail'), d.icon('network', X0, B, 'Coordination detail')
    tl, tr = d.icon('file-box', X1, T, 'Task Log'), d.icon('file-chart-column-increasing', X1, B, 'Tracker')
    ix, me = d.icon('file-search', XI, C, 'Index'), d.icon('folder-tree', XM, C, 'Memory')
    d.edge(ex, tl, (1, .5), (0, .5))
    d.edge(co, tr, (1, .5), (0, .5))
    d.edge(tl, ix, (1, .5), (0, .25), wp=[(E, T), (E, C - 7.5)])
    d.edge(tr, ix, (1, .5), (0, .75), wp=[(E, B), (E, C + 7.5)])
    d.edge(ix, me, (1, .5), (0, .5), line=True, dashed=True)
    note(d, (X0 + X1) / 2, T - 8, 'Recorded in')
    note(d, (X0 + X1) / 2, B + 8, 'Recorded in')
    note(d, (X1 + 15 + E) / 2, T - 8, 'Condensed into completed-work summaries', 200)
    note(d, (X1 + 15 + E) / 2, B + 8, 'Distilled into durable observations', 200)
    return d


def state_compression_phone(t):
    # Two columns running down, execution on the left and coordination on the right, meeting at the Index.
    d, LB, LB2 = D(342, 500, t, 13, 34), 40, 56  # LB2: below a two-line label
    L, M, R = 50, 171, 292  # columns
    S, G, IX, MM = 30, 180, 350, 450  # rows: detail, records, Index, Memory
    d.icon('boxes', L, S, 'Execution\ndetail')
    d.icon('network', R, S, 'Coordination\ndetail')
    tl, tr = d.icon('file-box', L, G, 'Task Log'), d.icon('file-chart-column-increasing', R, G, 'Tracker')
    ix, me = d.icon('file-search', M, IX, 'Index'), d.icon('folder-tree', M, MM, 'Memory')
    d.edge(d.point(L, S + LB2), tl, en=(.5, 0))
    d.edge(d.point(R, S + LB2), tr, en=(.5, 0))
    d.edge(d.point(L, G + LB), ix, en=(0, .5), wp=[(L, IX)])
    d.edge(d.point(R, G + LB), ix, en=(1, .5), wp=[(R, IX)])
    d.edge(d.point(M, IX + LB), me, en=(.5, 0), line=True, dashed=True)
    for x, a, b in ((L + 58, 'Recorded in', 'Condensed into\ncompleted-work\nsummaries'), (R - 58, 'Recorded in', 'Distilled into\ndurable\nobservations')):
        note(d, x, (S + LB2 + G - 17) / 2, a)
        note(d, x, (G + LB + IX) / 2 - 8, b)
    return d


def handoff(t):
    # Four channels from the outgoing agent to the incoming one: the Handoff Log above, the User in the
    # middle (dashed, straight), the Handoff Bus below carrying the Handoff Prompt, and other project state
    # the incoming agent reads. The Handoff Log and Handoff Bus are dashed to the User.
    d, LB = D(620, 310, t, 9), 34
    L, M, R = 40, 300, 560  # columns: outgoing agent, channel nodes, incoming agent
    E1, E2 = (L + M) / 2, (M + R) / 2  # elbow columns
    T, A, B, P = 30, 110, 190, 260  # rows: Handoff Log, agents and User, Handoff Bus, project state
    og = d.icon('bot', L, A, 'Outgoing agent with\naccumulated context')
    inc = d.icon('bot', R, A, 'Incoming agent with\nfresh context')
    hl, us = d.icon('file-box', M, T, 'Handoff Log'), d.icon('user', M, A, 'User')
    hb, ps = d.icon('file-input', M, B, 'Handoff Bus'), d.icon('boxes', M, P, 'Other relevant\nproject state')
    d.edge(og, hl, (1, .2), (0, .5), wp=[(E1, A - 9), (E1, T)])
    d.edge(hl, inc, (1, .5), (0, .2), wp=[(E2, T), (E2, A - 9)])
    d.edge(og, us, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(us, inc, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(og, hb, (1, .8), (0, .5), wp=[(E1, A + 9), (E1, B)])
    d.edge(hb, inc, (1, .5), (0, .8), wp=[(E2, B), (E2, A + 9)])
    d.edge(ps, inc, (1, .5), (0, .8), wp=[(E2, P), (E2, A + 9)])  # joins the Handoff Bus line at E2
    d.edge(d.point(M, T + LB), us, en=(.5, 0), line=True, dashed=True)
    d.edge(d.point(M, A + LB), hb, en=(.5, 0), line=True, dashed=True)
    note(d, (E1 + M - 15) / 2, T - 8, 'Writes')
    note(d, (E2 + M + 15) / 2, T - 8, 'Read by')
    note(d, (E1 + M - 15) / 2, B + 8, 'Writes to')
    note(d, (E2 + M + 15) / 2, B + 8, 'Read by')
    note(d, (E2 + M + 15) / 2, P + 8, 'Read by')
    return d


def handoff_phone(t):
    # The landscape figure turned a quarter: outgoing agent on top, incoming at the bottom, the channels
    # left to right: Handoff Log, User (dashed, straight down the middle), Handoff Bus, project state.
    d, LB, LB2 = D(342, 540, t, 13, 34), 40, 56  # LB2: below a two-line label
    L, M, BX, SX = 45, 135, 225, 300  # columns: Handoff Log, agents and User, Handoff Bus, project state
    OG, F, S, IN = 30, 200, 320, 480  # rows: outgoing, Log/User/Bus, project state, incoming
    og = d.icon('bot', M, OG, 'Outgoing agent with\naccumulated context')
    inc = d.icon('bot', M, IN, 'Incoming agent with\nfresh context')
    hl, us = d.icon('file-box', L, F, 'Handoff Log'), d.icon('user', M, F, 'User')
    hb = d.icon('file-input', BX, F, 'Handoff Bus')
    d.icon('boxes', SX, S, 'Other relevant\nproject state')
    d.edge(og, hl, (0, .5), (.5, 0), wp=[(L, OG)])
    d.edge(og, hb, (1, .5), (.5, 0), wp=[(BX, OG)])
    d.edge(d.point(M, OG + LB2), us, en=(.5, 0), line=True, dashed=True)
    d.edge(d.point(M, F + LB), inc, en=(.5, 0), line=True, dashed=True)
    d.edge(us, hl, (0, .5), (1, .5), line=True, dashed=True)
    d.edge(us, hb, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(d.point(L, F + LB), inc, en=(0, .5), wp=[(L, IN)])
    d.edge(d.point(BX, F + LB), inc, en=(1, .3), wp=[(BX, IN - 6)])
    d.edge(d.point(SX, S + LB2), inc, en=(1, .7), wp=[(SX, IN + 6)])
    note(d, L + 33, (OG + F) / 2, 'Writes')
    note(d, BX - 36, (OG + F) / 2, 'Writes to')
    note(d, L + 33, (F + LB + IN) / 2, 'Read by')
    note(d, BX - 36, (F + LB + IN) / 2, 'Read by')
    note(d, SX - 34, (S + LB2 + IN) / 2, 'Read by')
    return d


# Coded figures: name -> (desktop layout, phone layout). Output <name>[-phone]-<theme>.svg.
FIGURES = {'message-bus': (message_bus, message_bus_phone), 'state-compression': (state_compression, state_compression_phone),
           'handoff': (handoff, handoff_phone)}


def restyle(path, t):
    # Re-themes a thesis .drawio for the site: ink text and lines in Literata, no fills, icons recoloured
    # to ink, label backgrounds in paper so a label breaks the line it sits on. Labels stay HTML, so the
    # browser wraps them and sizes their backgrounds with the real font. Returns the draw.io XML.
    tree = ET.parse(path)
    model = tree.find('.//mxGraphModel')
    if model is not None:
        model.attrib.pop('background', None)
    base = f"fontFamily={FONT};fontColor={t['ink']};strokeColor={t['ink']};fillColor=none;labelBackgroundColor={t['paper']};"
    icon = lambda m: 'image=data:image/svg+xml,' + base64.b64encode(  # noqa: E731
        base64.b64decode(m.group(1)).replace(b'currentColor', t['ink'].encode())).decode()
    for cell in tree.iter('mxCell'):
        style = cell.get('style')
        if style is None:
            continue
        style = re.sub(r'(labelBackgroundColor|fontFamily|fontColor|strokeColor|fillColor)=[^;]*;?', '', style)
        cell.set('style', re.sub(r'image=data:image/svg\+xml,([^;]+)', icon, style) + base)
    return ET.tostring(tree.getroot(), encoding='unicode')


def literata_ttf(tmp):
    # d2 needs .ttf files: Google Fonts serves TrueType when asked without a browser user agent.
    css = urllib.request.urlopen('https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,600;0,700;1,400').read().decode()
    files = {}
    for style, weight, url in re.findall(r'font-style: (\w+);\s*font-weight: (\d+);\s*src: url\((\S+?)\)', css):
        name = 'italic' if style == 'italic' else {'400': 'regular', '600': 'semibold', '700': 'bold'}[weight]
        files[name] = os.path.join(tmp, f'literata-{name}.ttf')
        open(files[name], 'wb').write(urllib.request.urlopen(url).read())
    return files


def d2_svg(path, t, fonts, tmp):
    # Re-themes a thesis .d2 by swapping its black/white/grey for ink/paper/deep, then renders it with Literata.
    code = open(path).read().replace('#000000', t['ink']).replace('#ffffff', t['paper']).replace('#ebebeb', t['deep'])
    src, out = os.path.join(tmp, 'in.d2'), os.path.join(tmp, 'out.svg')
    open(src, 'w').write(code + '\nstyle.fill: transparent\n')
    subprocess.run(['d2', *[f'--font-{k}={v}' for k, v in fonts.items()], src, out], check=True, capture_output=True)
    svg = open(out).read()
    # Sequence diagrams: d2 paints the frame white (its N7 colour) and blends groups at 50% multiply,
    # which turns the loop box grey on paper and murky on dark. Drop both so our colours show as set.
    svg = re.sub(r'(\.fill-N7\{fill:)#FFFFFF', r'\1none', svg).replace('fill="#FFFFFF"', 'fill="none"')
    svg = re.sub(r'\.blend \{[^}]*\}', '', svg)
    # Without the blend a group's box hides the lifelines it covers, so move each box (`shape blend`) back
    # to just before the first lifeline; its label stays on top. Element classes are base64 ids.
    tags = list(re.finditer(r'<g class="([A-Za-z0-9+/=]+)">', svg))
    lifeline = next((m.start() for m in tags if ' -- )' in base64.b64decode(m.group(1)).decode(errors='ignore')), None)
    boxes = [(m.start(), svg.index('</g>', m.start()) + 4) for m in re.finditer(r'<g class="shape blend"', svg)]
    if lifeline is None or not boxes:
        return svg
    moved = ''.join(svg[a:b] for a, b in boxes)
    for a, b in reversed(boxes):  # boxes follow the lifelines, so cutting them leaves `lifeline` valid
        svg = svg[:a] + svg[b:]
    return svg[:lifeline] + moved + svg[lifeline:]


def font_css(svgs):
    # Subset Literata (regular + italic) to the glyphs the diagrams use, via the Google Fonts `text=` API,
    # and inline it so the SVGs render with the right font inside an <img>.
    chars = ''.join(sorted(set(''.join(re.findall(r'>([^<>]+)</text>', ''.join(svgs))))))
    css = ''
    for ital in (0, 1):
        url = f'https://fonts.googleapis.com/css2?family=Literata:ital@{ital}&text={urllib.parse.quote(chars)}'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 Chrome/120'})  # UA gets woff2
        found = re.search(r'url\((\S+?)\)', urllib.request.urlopen(req).read().decode())
        if not found:
            raise RuntimeError(f'no font URL in the Google Fonts response for {url}')
        b64 = base64.b64encode(urllib.request.urlopen(found.group(1)).read()).decode()
        css += f"@font-face{{font-family:{FONT};font-style:{'italic' if ital else 'normal'};src:url(data:font/woff2;base64,{b64})}}"
    return f'<style>{css}</style>'


def inject(svg, style):
    # Puts a <style> block first inside the root <svg>.
    return re.sub(r'(<svg[^>]*>)', lambda m: m.group(1) + style, svg, count=1)


def main():
    # Collect every variant as draw.io XML, export each through drawio, inline a font subset per figure
    # (shared by its themes and variants), then render the d2 figures (which carry their own font).
    # Keys are (figure, variant, theme); the file is <figure><variant>-<theme>.svg.
    drawio = lambda f: os.path.join(SRC, 'drawio', f)  # noqa: E731
    jobs = {}
    for theme, t in THEMES.items():
        for hl in PARTS:
            jobs['overview', '-' + hl if hl else '', theme] = desktop(t, hl).xml()
        jobs['overview', '-phone', theme] = phone(t).xml()
        for name, (wide, narrow) in FIGURES.items():
            jobs[name, '', theme], jobs[name, '-phone', theme] = wide(t).xml(), narrow(t).xml()
        for f in sorted(os.listdir(os.path.join(SRC, 'drawio'))):
            jobs[f.removesuffix('.drawio'), '', theme] = restyle(drawio(f), t)
    svgs = {}
    with tempfile.TemporaryDirectory() as tmp:
        for key, xml in jobs.items():
            src, out = os.path.join(tmp, 'in.drawio'), os.path.join(tmp, 'out.svg')
            open(src, 'w').write(xml)
            # --theme light keeps colours literal (auto wraps them in light-dark()); fonts are inlined below.
            subprocess.run(['drawio', '-x', '-f', 'svg', '-t', '-b', '8', '--theme', 'light', '--embed-svg-fonts', 'false', '-o', out, src],
                           check=True, capture_output=True)
            svgs[key] = open(out).read()
        styles = {fig: font_css([v for k, v in svgs.items() if k[0] == fig]) for fig in {k[0] for k in svgs}}
        svgs = {k: inject(svg, styles[k[0]]) for k, svg in svgs.items()}
        fonts = literata_ttf(tmp)
        for theme, t in THEMES.items():
            for f in sorted(os.listdir(os.path.join(SRC, 'd2'))):
                svgs[f.removesuffix('.d2'), '', theme] = d2_svg(os.path.join(SRC, 'd2', f), t, fonts, tmp)
    os.makedirs(OUT, exist_ok=True)
    for (fig, variant, theme), svg in svgs.items():
        name = f'{fig}{variant}-{theme}.svg'
        open(os.path.join(OUT, name), 'w').write(svg)
        print('wrote', name)


if __name__ == '__main__':
    main()
