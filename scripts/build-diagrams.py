# Builds the site's diagrams into static/img/diagrams/ as <name>[-<variant>]-<theme>.svg, theme light or dark.
# Run: python3 scripts/build-diagrams.py <thesis checkout>   (needs the `drawio` and `d2` CLIs on PATH, and network for the font)
# Sources:
# - Coded here (icons from diagrams/icons/): the overview (landing page, Introduction; desktop()/phone(), one
#   SVG per highlight for desktop and -phone, adapted from the thesis deck's gen.py) and the thesis figures in
#   FIGURES (Message Bus, state compression, Handoff with -phone; the two phase figures desktop only).
#   Edit the layout functions, not the SVGs.
# - Re-themed from the thesis: its diagrams/framework-design/*.d2 (d2_svg()), read from the checkout; one SVG
#   per theme, no phone layout. Figures take their thesis file names, so the thesis reader maps them by name.
# Pipeline: draw.io XML -> the drawio CLI exports SVG -> font_css() inlines a Literata subset so the SVG
# renders right inside an <img>. d2 embeds its own font subset from the TTFs fetched by literata_ttf().
import base64
import glob
import html
import os
import re
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'diagrams')
OUT = os.path.join(ROOT, 'static', 'img', 'diagrams')
# Book colours (Gruvbox), kept in sync with --apm-ink/-paper/-deep in src/css/custom.css.
THEMES = {'light': {'ink': '#3C3836', 'paper': '#FBF1C7', 'deep': '#EBDBB2'},
          'dark': {'ink': '#EBDBB2', 'paper': '#282828', 'deep': '#3C3836'}}
PARTS = (None, 'planning', 'manager', 'workers', 'user', 'state')  # None = no highlight
FADE = 'opacity=20;textOpacity=20;'  # appended to a cell's style to dim it
FONT = 'Literata'


def thin(svg, size):
    # Sets a Lucide icon's stroke-width (2 in its 24-unit viewBox) to 36 / size, so it draws ~1.5px thick, a
    # little heavier than the 1px edges so nodes still lead: 1.2 at 30px, ~1.06 at 34px. Only the root's attribute changes.
    return re.sub(r'stroke-width="[^"]*"', f'stroke-width="{36 / size:.3g}"', svg, count=1)


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
        svg = thin(open(os.path.join(SRC, 'icons', name + '.svg')).read().replace('currentColor', self.t['ink']), size)  # stroke 36/size (~1.5px)
        img = base64.b64encode(svg.encode()).decode()
        st = f"shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=data:image/svg+xml,{img};" + FADE * fade
        return self.add(label, st, f'<mxGeometry x="{x-size/2}" y="{y-size/2}" width="{size}" height="{size}" as="geometry"/>', vertex=1)

    def text(self, x, y, w, label, fade=False, italic=True):
        # A free-standing label, w wide: italic for phase titles, upright for edge labels.
        st = f'text;html=0;align=center;verticalAlign=middle;fontStyle={2 if italic else 0};' + FADE * fade
        return self.add(label, st, f'<mxGeometry x="{x-w/2}" y="{y-10}" width="{w}" height="20" as="geometry"/>', vertex=1)

    def shape(self, kind, x, y, w, h, label):
        # An unfilled decision diamond or start/end circle, centred at (x, y).
        if kind not in ('rhombus', 'ellipse'):
            raise ValueError(f'unsupported shape: {kind}')
        st = f'{kind};html=0;align=center;verticalAlign=middle;fillColor=none;'
        return self.add(label, st, f'<mxGeometry x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" as="geometry"/>', vertex=1)

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
    # Which groups fade when `hl` is highlighted: P/I planning/implementation agents, M/W the Manager/Workers,
    # PS/IS their files (MS the Manager's Tracker, WS the Workers' Memory edge),
    # U the users and relays, H the Planning-to-Implementation arrow. Phase maps keep their own files.
    return dict(P=hl not in (None, 'planning'), I=hl not in (None, 'manager', 'workers'), M=hl not in (None, 'manager'), W=hl not in (None, 'workers'),
                PS=hl not in (None, 'planning', 'state'), IS=hl not in (None, 'state', 'manager', 'workers'),
                MS=hl not in (None, 'state', 'manager'), WS=hl not in (None, 'state', 'workers'),
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
    ma = d.icon('bot', X[2], Y, 'Manager', f['M'])
    u2 = d.icon('user', X[3], Y, 'User', f['I'] and f['U'])
    wo = d.icon('bot', X[4], Y, 'Workers', f['W'])
    d.edge(pl, u1, (1, .5), (0, .5), both=True, fade=f['P'] and f['U'])
    d.edge(u1, ma, (1, .5), (0, .5), dashed=True, fade=f['H'])  # hand-off from Planning to Implementation
    d.edge(ma, u2, (1, .5), (0, .5), both=True, fade=f['M'] and f['U'])
    d.edge(u2, wo, (1, .5), (0, .5), both=True, fade=f['W'] and f['U'])
    sp = d.icon('file-cog', (X[0] + X[1]) / 2, FY, 'Spec, Plan, Rules', f['PS'])
    d.edge(d.point(X[0], LY), sp, en=(0, .5), line=True, dashed=True, fade=f['PS'], wp=[(X[0], FY)])
    d.edge(d.point(X[1], LY), sp, en=(1, .5), line=True, dashed=True, fade=f['PS'], wp=[(X[1], FY)])
    bus = d.icon('inbox', X[3], BY, 'Message Bus', f['IS'] and f['U'])
    d.edge(ma, bus, (.5, 0), (0, .5), line=True, dashed=True, fade=f['MS'])
    d.edge(wo, bus, (.5, 0), (1, .5), line=True, dashed=True, fade=f['WS'])
    d.edge(u2, d.point(X[3], BY + 34), (.5, 0), line=True, dashed=True, fade=f['IS'] and f['U'])
    tr = d.icon('file-chart-column-increasing', (X[2] + X[3]) / 2, FY, 'Tracker', f['MS'])
    me = d.icon('folder-tree', (X[3] + X[4]) / 2, FY, 'Memory', f['IS'])
    d.edge(d.point(X[2], LY), tr, en=(0, .5), line=True, dashed=True, fade=f['MS'], wp=[(X[2], FY)])
    d.edge(tr, me, (1, .5), (0, .5), line=True, dashed=True, fade=f['MS'])
    d.edge(d.point(X[4], LY), me, en=(1, .5), line=True, dashed=True, fade=f['WS'], wp=[(X[4], FY)])
    return d


def phone(t, hl=None):
    # Portrait, 342 wide: Planning above Implementation, the hand-off down the right side.
    # Implementation runs right to left so the Manager sits under the Planning User. Highlights as desktop().
    # Row y's: phase titles T1/T2, agents A/IM, files S/F, message bus B. LB = icon centre to just below its label.
    T1, A, S, T2, B, IM, F, LB = 0, 60, 150, 250, 305, 405, 500, 40
    f, d = fades(hl), D(342, F + 30, t, 13, 34)
    L, M, R = 44, 171, 286  # columns: left, middle, right
    d.text(M, T1, 300, 'Planning Phase', f['P'])
    pl = d.icon('bot', L, A, 'Planner', f['P'])
    u1 = d.icon('user', R, A, 'User', f['P'] and f['U'])
    d.edge(pl, u1, (1, .5), (0, .5), both=True, fade=f['P'] and f['U'])
    sp = d.icon('file-cog', M, S, 'Spec, Plan, Rules', f['PS'])
    d.edge(d.point(L, A + LB), sp, en=(0, .5), line=True, dashed=True, fade=f['PS'], wp=[(L, S)])
    d.edge(d.point(R, A + LB), sp, en=(1, .5), line=True, dashed=True, fade=f['PS'], wp=[(R, S)])
    d.text(M, T2, 300, 'Implementation Phase', f['I'])
    bus = d.icon('inbox', M, B, 'Message Bus', f['IS'] and f['U'])
    wo = d.icon('bot', L, IM, 'Workers', f['W'])
    u2 = d.icon('user', M, IM, 'User', f['I'] and f['U'])
    ma = d.icon('bot', R, IM, 'Manager', f['M'])
    d.edge(u1, ma, (1, .5), (1, .5), dashed=True, fade=f['H'], wp=[(330, A), (330, IM)])  # hand-off
    d.edge(ma, u2, (0, .5), (1, .5), both=True, fade=f['M'] and f['U'])
    d.edge(u2, wo, (0, .5), (1, .5), both=True, fade=f['W'] and f['U'])
    d.edge(ma, bus, (.5, 0), (1, .5), line=True, dashed=True, fade=f['MS'])
    d.edge(wo, bus, (.5, 0), (0, .5), line=True, dashed=True, fade=f['WS'])
    d.edge(u2, d.point(M, B + LB), (.5, 0), line=True, dashed=True, fade=f['IS'] and f['U'])
    me = d.icon('folder-tree', (L + M) / 2, F, 'Memory', f['IS'])
    tr = d.icon('file-chart-column-increasing', (M + R) / 2, F, 'Tracker', f['MS'])
    d.edge(d.point(L, IM + LB), me, en=(0, .5), line=True, dashed=True, fade=f['WS'], wp=[(L, F)])
    d.edge(me, tr, (1, .5), (0, .5), line=True, dashed=True, fade=f['MS'])
    d.edge(d.point(R, IM + LB), tr, en=(1, .5), line=True, dashed=True, fade=f['MS'], wp=[(R, F)])
    return d


# The figures below follow the overview's conventions: agents and files are labelled icons, solid arrows
# carry a message or a write, dashed lines tie the User to what they mediate (or a file to what holds it).
# Edge labels sit beside their line, never on it, mirrored above/below (or left/right) for symmetry.
# A label always takes the outer side of its segment: above a top horizontal, below a bottom one, left of a left
# vertical, right of a right one; on inner segments, the side facing away from the figure's centre.
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
    # middle (dashed, straight), the Handoff Bus below carrying the Handoff Prompt, and other session state
    # the incoming agent reads. The Handoff Log and Handoff Bus are dashed to the User.
    d, LB = D(620, 310, t, 9), 34
    L, M, R = 40, 300, 560  # columns: outgoing agent, channel nodes, incoming agent
    E1, E2 = (L + M) / 2, (M + R) / 2  # elbow columns
    T, A, B, P = 30, 110, 190, 260  # rows: Handoff Log, agents and User, Handoff Bus, session state
    og = d.icon('bot', L, A, 'Outgoing agent with\naccumulated context')
    inc = d.icon('bot', R, A, 'Incoming agent with\nfresh context')
    hl, us = d.icon('file-box', M, T, 'Handoff Log'), d.icon('user', M, A, 'User')
    hb, ps = d.icon('file-input', M, B, 'Handoff Bus'), d.icon('boxes', M, P, 'Other relevant\nsession state')
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
    # left to right: Handoff Log, User (dashed, straight down the middle), Handoff Bus, session state.
    d, LB, LB2 = D(342, 540, t, 13, 34), 40, 56  # LB2: below a two-line label
    L, M, BX, SX = 45, 135, 225, 300  # columns: Handoff Log, agents and User, Handoff Bus, session state
    OG, F, S, IN = 30, 200, 320, 480  # rows: outgoing, Log/User/Bus, session state, incoming
    og = d.icon('bot', M, OG, 'Outgoing agent with\naccumulated context')
    inc = d.icon('bot', M, IN, 'Incoming agent with\nfresh context')
    hl, us = d.icon('file-box', L, F, 'Handoff Log'), d.icon('user', M, F, 'User')
    hb = d.icon('file-input', BX, F, 'Handoff Bus')
    d.icon('boxes', SX, S, 'Other relevant\nsession state')
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


def planning_phase(t):
    # Two left-to-right rows, as in the source: discovery above, documents below. The clarification loop
    # returns over row 1; "Yes" runs down the left lane into the documents; the revision loop returns over row 2.
    d, LB = D(720, 420, t, 9), 38
    S, INITIATE, G, U, P, A = 45, 165, 285, 405, 525, 675  # row 1 columns
    LANE, WRITE, REVIEW, CHECK, END = 45, 165, 320, 470, 610  # row 2 columns; LANE carries "Yes" down
    TOP, MID, LOWER, FILE = 80, 160, 255, 365  # rows; MID is the "Yes" lane's turn
    LOOP1, LOOP2 = 22, 205  # y's of the clarification and revision returns
    start = d.shape('ellipse', S, TOP, 54, 54, 'Project\nbegins')
    initiate = d.icon('user', INITIATE, TOP, 'User initiates\nPlanner')
    gather = d.icon('bot', G, TOP, 'Planner gathers\ncontext and elicits\nrequirements')
    requirements = d.icon('user', U, TOP, 'User articulates\nrequirements')
    propose = d.icon('bot', P, TOP, 'Planner consolidates\nand proposes\napproaches')
    aligned = d.shape('rhombus', A, TOP, 64, 50, 'Aligned?')
    write = d.icon('bot', WRITE, LOWER, 'Planner creates\nplanning documents')
    review = d.icon('user', REVIEW, LOWER, 'User reviews\nfor completeness')
    checked = d.shape('rhombus', CHECK, LOWER, 64, 50, 'Aligned?')
    done = d.shape('ellipse', END, LOWER, 60, 60, 'Planning\ncomplete')
    specs = d.icon('file-cog', WRITE, FILE, 'Spec, Plan, Rules')

    for source, target in ((start, initiate), (initiate, gather), (gather, requirements)):
        d.edge(source, target, (1, .5), (0, .5))
    d.edge(requirements, propose, (1, .25), (0, .25))
    d.edge(propose, requirements, (0, .75), (1, .75))
    d.edge(propose, aligned, (1, .5), (0, .5))
    note(d, (P + 15 + A - 32) / 2, TOP - 22, 'Presents\nunderstanding', 90)
    d.edge(aligned, requirements, (.5, 0), (.5, 0), wp=[(A, LOOP1), (U, LOOP1)])
    note(d, (U + A) / 2, LOOP1 - 10, 'No, understanding gap: clarify', 170)
    d.edge(aligned, write, (.5, 1), (0, .5), wp=[(A, MID), (LANE, MID), (LANE, LOWER)])
    note(d, A + 14, TOP + 34, 'Yes', 30)

    d.edge(write, review, (1, .5), (0, .5))
    d.edge(review, checked, (1, .5), (0, .5))
    d.edge(checked, write, (.5, 0), (.5, 0), wp=[(CHECK, LOOP2), (WRITE, LOOP2)])
    note(d, (WRITE + CHECK) / 2, LOOP2 - 10, 'No, document issue: revise', 170)
    d.edge(checked, done, (1, .5), (0, .5))
    note(d, (CHECK + 32 + END - 30) / 2, LOWER - 12, 'Yes', 30)
    d.edge(d.point(WRITE, LOWER + LB + 6), specs, en=(.5, 0), line=True, dashed=True)
    return d


def implementation_phase(t):
    # The original workflow in bands: handoff across the top, assignment, execution, reporting. The first
    # Aligned? sits above the Manager's update so its "Yes" drops straight in; "User initiates new Worker"
    # hangs below the New Worker? decision and feeds the notification. Dashed channels: a spine down column M
    # (Manager, Message Bus, Workers' reports) with the Tracker and Spec, Plan, Rules tied to it, and the
    # Message Bus line across WORK with Memory and Deliverables hanging from it. Each dashed segment is drawn once.
    d = D(770, 920, t, 9)
    L, M, R, E = 100, 380, 535, 630  # columns: reviewer, main, New Worker?, Workers
    LOOP, LANE = 742, 58  # x's of the retry loop and the project-complete lane
    TR, PL = M - 120, M + 120  # Tracker and Spec, Plan, Rules (Memory and Deliverables share them)
    INIT, ASSIGN, WORK, REPORT = 100, 290, 545, 790
    DOC, STATE, LOOP1 = 460, 665, 205  # LOOP1: y of the revise loop and of User initiates new Worker
    S = 9  # the top row sits 9px right, so its Yes drops straight into the update's top-right
    start = d.shape('ellipse', 48 + S, INIT, 86, 86, 'Implementation\nbegins')
    initiate_manager = d.icon('user', 148 + S, INIT, 'User initiates\nManager')
    review_plan = d.icon('bot', 255 + S, INIT, 'Manager reviews\nplanning documents')
    first_aligned = d.shape('rhombus', M + S, INIT, 64, 58, 'Aligned?')
    update = d.icon('bot', M, ASSIGN, 'Manager updates Tracker,\nmaintains planning documents\nand writes assignments')
    new_worker = d.shape('rhombus', R, ASSIGN, 74, 58, 'New Worker?')
    initiate_worker = d.icon('user', R, LOOP1, '')
    note(d, R, LOOP1 - 29, 'User initiates\nnew Worker', 100)  # above its icon, clear of the Yes line below
    notify_workers = d.icon('user', E, ASSIGN, 'User notifies\nWorkers')
    tracker = d.icon('file-chart-column-increasing', TR, DOC, 'Tracker')
    plan = d.icon('file-cog', PL, DOC, 'Spec, Plan, Rules')
    second_aligned = d.shape('rhombus', L, ASSIGN, 64, 58, 'Aligned?')
    complete = d.shape('ellipse', LANE, 420, 64, 64, 'Project\ncomplete')
    review_logs = d.icon('bot', L, WORK, 'Manager reviews\nlogs and reports')
    bus = d.icon('inbox', M, WORK, 'Message Bus')
    read_assignments = d.icon('bot', E, WORK, 'Workers read and\nexecute assignments')
    memory = d.icon('folder-tree', TR, STATE, 'Memory')
    deliverables = d.icon('boxes', PL, STATE, 'Deliverables')
    notify_manager = d.icon('user', L, REPORT, 'User notifies\nManager')
    write_reports = d.icon('bot', M, REPORT, 'Workers write\nlogs and reports')
    success = d.shape('rhombus', E, REPORT, 72, 58, 'Success?')

    d.edge(start, initiate_manager, (1, .5), (0, .5))
    d.edge(initiate_manager, review_plan, (1, .5), (0, .5))
    d.edge(review_plan, first_aligned, (1, .5), (0, .5))
    note(d, (255 + 15 + M - 32) / 2 + S, INIT - 27, 'Presents\nunderstanding', 112)
    d.edge(first_aligned, review_plan, (.5, 0), (.5, 0), wp=[(M + S, 35), (255 + S, 35)])
    note(d, (255 + M) / 2 + S, 26, 'No, understanding gap: clarify', 180)
    d.edge(first_aligned, update, (.5, 1), (.8, 0))  # into its top-right
    note(d, M + S + 16, 160, 'Yes', 30)

    d.edge(update, new_worker, (1, .5), (0, .5))
    d.edge(new_worker, initiate_worker, (.5, 0), (.5, 1))
    note(d, R + 16, ASSIGN - 49, 'Yes', 30)
    d.edge(new_worker, notify_workers, (1, .5), (0, .5))
    note(d, (R + 37 + E - 15) / 2, ASSIGN - 13, 'No', 30)
    d.edge(initiate_worker, notify_workers, (1, .5), (.5, 0), wp=[(E, LOOP1)])  # into its top centre
    d.edge(d.point(E, ASSIGN + 50), read_assignments, en=(.5, 0))

    d.edge(d.point(M, ASSIGN + 69), bus, en=(.5, 0), line=True, dashed=True)  # below the three-line label
    d.edge(d.point(M, DOC), tracker, en=(1, .5), line=True, dashed=True)
    d.edge(d.point(M, DOC), plan, en=(0, .5), line=True, dashed=True)
    d.edge(review_logs, bus, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(read_assignments, bus, (0, .5), (1, .5), line=True, dashed=True)
    d.edge(d.point(TR, WORK), memory, en=(.5, 0), line=True, dashed=True)
    d.edge(d.point(M, STATE), memory, en=(1, .5), line=True, dashed=True)
    d.edge(d.point(PL, WORK), deliverables, en=(.5, 0), line=True, dashed=True)
    d.edge(d.point(M, STATE), deliverables, en=(0, .5), line=True, dashed=True)
    d.edge(write_reports, d.point(M, WORK + 48), (.5, 0), line=True, dashed=True)

    d.edge(d.point(E, WORK + 54), success, en=(.5, 0))
    d.edge(success, read_assignments, (1, .5), (1, .5), wp=[(LOOP, REPORT), (LOOP, WORK)])
    note(d, (E + 15 + LOOP) / 2, WORK - 22, 'No, recoverable:\niterate', 90)
    d.edge(success, write_reports, (0, .5), (1, .5))
    note(d, E - 52, REPORT - 12, 'Yes', 30)
    d.edge(success, d.point(M, REPORT + 49), (.5, 1), wp=[(E, 870), (M, 870)])  # up to just under the node's label
    note(d, (E + M) / 2, 882, 'No, blocker: escalate', 130)
    d.edge(write_reports, notify_manager, (0, .5), (1, .5))
    d.edge(notify_manager, d.point(L, WORK + 54), (.5, 0))
    d.edge(review_logs, second_aligned, (.5, 0), (.5, 1))
    d.edge(second_aligned, complete, (0, .5), (.5, 0), wp=[(LANE, ASSIGN), (LANE, 380)])
    note(d, LANE - 33, 335, 'Yes,\nno work\nremains', 48)
    d.edge(second_aligned, update, (1, .5), (0, .5))
    note(d, (L + 32 + M - 15) / 2, ASSIGN - 20, 'Yes, work remains', 135)
    d.edge(second_aligned, update, (.5, 0), (.2, 0), wp=[(L, LOOP1), (M - 9, LOOP1)])  # into its top-left, beside the Yes drop
    note(d, (L + M) / 2, LOOP1 - 12, 'No, planning or contained issue: revise or retry', 230)
    return d


# Coded figures: name -> (desktop layout, phone layout or None). Output <name>[-phone]-<theme>.svg.
FIGURES = {'message-bus': (message_bus, message_bus_phone), 'state-compression': (state_compression, state_compression_phone),
           'handoff': (handoff, handoff_phone),
           'planning-phase-overview': (planning_phase, None), 'implementation-phase-overview': (implementation_phase, None)}


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
    jobs = {}
    for theme, t in THEMES.items():
        for hl in PARTS:
            jobs['overview', '-' + hl if hl else '', theme] = desktop(t, hl).xml()
        for hl in PARTS:
            jobs['overview', '-phone' + ('-' + hl if hl else ''), theme] = phone(t, hl).xml()
        for name, (wide, narrow) in FIGURES.items():
            jobs[name, '', theme] = wide(t).xml()
            if narrow:
                jobs[name, '-phone', theme] = narrow(t).xml()
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
            for f in sorted(glob.glob(os.path.join(sys.argv[1], 'diagrams', 'framework-design', '*.d2'))):
                svgs[os.path.basename(f).removesuffix('.d2'), '', theme] = d2_svg(f, t, fonts, tmp)
    os.makedirs(OUT, exist_ok=True)
    for (fig, variant, theme), svg in svgs.items():
        name = f'{fig}{variant}-{theme}.svg'
        open(os.path.join(OUT, name), 'w').write(svg)
        print('wrote', name)


if __name__ == '__main__':
    main()
