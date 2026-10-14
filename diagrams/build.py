# Builds the landing-page overview diagrams into static/img/diagrams/.
# Run: python3 diagrams/build.py   (needs the draw.io desktop CLI `drawio` on PATH)
# Output per theme: book-<theme>-overview[-<part>].svg (desktop, one per highlight) and -phone.svg.
# Layout is generated here (adapted from the thesis deck's gen.py), so edit this file, not the SVGs.
import base64, html, os, re, subprocess, tempfile, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', 'static', 'img', 'diagrams')
# Book ink colour (Gruvbox fg1), kept in sync with --apm-ink in src/pages/index.css.
THEMES = {'light': {'ink': '#3C3836'}, 'dark': {'ink': '#EBDBB2'}}
PARTS = (None, 'planning', 'implementation', 'state', 'user')
FADE = 'opacity=20;textOpacity=20;'
FONT = 'Literata'


class D:
    """Minimal draw.io writer: icons with labels, text, invisible points and orthogonal edges."""

    def __init__(s, w, h, t, fs, isz=30):
        s.cells, s.n, s.w, s.h, s.t, s.isz = [], 2, w, h, t, isz
        s.base = f"fontFamily={FONT};fontSize={fs};fontColor={t['ink']};strokeColor={t['ink']};"

    def id(s):
        s.n += 1
        return f'c{s.n}'

    def add(s, label, style, geo, **attrs):
        i = s.id()
        a = ' '.join(f'{k}="{v}"' for k, v in attrs.items())
        s.cells.append(f'<mxCell id="{i}" value="{html.escape(label)}" style="{s.base}{style}" {a} parent="1">{geo}</mxCell>')
        return i

    def icon(s, name, x, y, label, fade=False):
        size = s.isz
        svg = open(os.path.join(ROOT, 'icons', name + '.svg')).read().replace('currentColor', s.t['ink'])
        img = base64.b64encode(svg.encode()).decode()
        st = f"shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;image=data:image/svg+xml,{img};" + FADE * fade
        return s.add(label, st, f'<mxGeometry x="{x-size/2}" y="{y-size/2}" width="{size}" height="{size}" as="geometry"/>', vertex=1)

    def text(s, x, y, w, label, fade=False):
        st = 'text;html=0;align=center;verticalAlign=middle;fontStyle=2;' + FADE * fade  # italic phase titles
        return s.add(label, st, f'<mxGeometry x="{x-w/2}" y="{y-10}" width="{w}" height="20" as="geometry"/>', vertex=1)

    def point(s, x, y):
        return s.add('', 'text;html=0;', f'<mxGeometry x="{x}" y="{y}" width="0" height="0" as="geometry"/>', vertex=1)

    def edge(s, a, b, ex=None, en=None, line=False, dashed=False, both=False, fade=False, wp=()):
        st = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endSize=5;startSize=5;'
        if ex: st += f'exitX={ex[0]};exitY={ex[1]};exitDx=0;exitDy=0;'
        if en: st += f'entryX={en[0]};entryY={en[1]};entryDx=0;entryDy=0;'
        if dashed: st += 'dashed=1;dashPattern=8 8;'
        if line: st += 'endArrow=none;'  # a dashed link to a file, not a message
        if both: st += 'startArrow=classic;startFill=1;'
        pts = ''.join(f'<mxPoint x="{x}" y="{y}"/>' for x, y in wp)
        geo = f'<mxGeometry relative="1" as="geometry">' + (f'<Array as="points">{pts}</Array>' if pts else '') + '</mxGeometry>'
        return s.add('', st + FADE * fade, geo, edge=1, source=a, target=b)

    def xml(s):
        return (f'<mxfile><diagram name="p" id="p"><mxGraphModel pageWidth="{s.w}" pageHeight="{s.h}"><root>'
                '<mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(s.cells) + '</root></mxGraphModel></diagram></mxfile>')


def fades(hl):
    # Which groups fade when `hl` is highlighted. Phase maps keep their own state at full strength.
    return dict(P=hl not in (None, 'planning'), I=hl not in (None, 'implementation'),
                PS=hl not in (None, 'planning', 'state'), IS=hl not in (None, 'implementation', 'state'),
                U=hl not in (None, 'user'), H=hl is not None and hl != 'user')


def desktop(t, hl):
    f, d = fades(hl), D(720, 260, t, 9)
    S = 150; X = [60 + S * k for k in range(5)]  # planner, user, manager, user, workers
    BY, Y = 50, 140; LY, FY = Y + 34, Y + 95
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
    # Implementation runs right to left so the Manager sits under the Planning User.
    # Row y's: phase titles T1/T2, agents A/I, files S/F, message bus B. LB = icon centre to just below its label.
    T1, A, S, T2, B, I, F, LB = 0, 60, 150, 250, 305, 405, 500, 40
    d = D(342, F + 30, t, 13, 34)
    L, M, R = 44, 171, 286
    d.text(M, T1, 300, 'Planning Phase')
    pl = d.icon('bot', L, A, 'Planner')
    u1 = d.icon('user', R, A, 'User')
    d.edge(pl, u1, (1, .5), (0, .5), both=True)
    sp = d.icon('file-cog', M, S, 'Spec, Plan, Rules')
    d.edge(d.point(L, A + LB), sp, en=(0, .5), line=True, dashed=True, wp=[(L, S)])
    d.edge(d.point(R, A + LB), sp, en=(1, .5), line=True, dashed=True, wp=[(R, S)])
    d.text(M, T2, 300, 'Implementation Phase')
    bus = d.icon('inbox', M, B, 'Message Bus')
    wo = d.icon('bot', L, I, 'Workers')
    u2 = d.icon('user', M, I, 'User')
    ma = d.icon('bot', R, I, 'Manager')
    d.edge(u1, ma, (1, .5), (1, .5), dashed=True, wp=[(330, A), (330, I)])
    d.edge(ma, u2, (0, .5), (1, .5), both=True)
    d.edge(u2, wo, (0, .5), (1, .5), both=True)
    d.edge(ma, bus, (.5, 0), (1, .5), line=True, dashed=True)
    d.edge(wo, bus, (.5, 0), (0, .5), line=True, dashed=True)
    d.edge(u2, d.point(M, B + LB), (.5, 0), line=True, dashed=True)
    me = d.icon('folder-tree', (L + M) / 2, F, 'Memory')
    tr = d.icon('file-chart-column-increasing', (M + R) / 2, F, 'Tracker')
    d.edge(d.point(L, I + LB), me, en=(0, .5), line=True, dashed=True, wp=[(L, F)])
    d.edge(me, tr, (1, .5), (0, .5), line=True, dashed=True)
    d.edge(d.point(R, I + LB), tr, en=(1, .5), line=True, dashed=True, wp=[(R, F)])
    return d


def font_css(svgs):
    # Subset Literata (regular + italic) to the glyphs the diagrams use, via the Google Fonts `text=` API,
    # and inline it so the SVGs render with the right font inside an <img>.
    chars = ''.join(sorted(set(''.join(re.findall(r'>([^<>]+)</text>', ''.join(svgs))))))
    css = ''
    for ital in (0, 1):
        url = f'https://fonts.googleapis.com/css2?family=Literata:ital@{ital}&text={urllib.parse.quote(chars)}'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 Chrome/120'})  # UA gets woff2
        src = re.search(r'url\((\S+?)\)', urllib.request.urlopen(req).read().decode()).group(1)
        b64 = base64.b64encode(urllib.request.urlopen(src).read()).decode()
        css += f"@font-face{{font-family:{FONT};font-style:{'italic' if ital else 'normal'};src:url(data:font/woff2;base64,{b64})}}"
    return f'<style>{css}</style>'


def main():
    jobs = {}
    for theme, t in THEMES.items():
        for hl in PARTS:
            jobs[f"book-{theme}-overview{'-' + hl if hl else ''}"] = desktop(t, hl)
        jobs[f'book-{theme}-overview-phone'] = phone(t)
    svgs = {}
    with tempfile.TemporaryDirectory() as tmp:
        for name, d in jobs.items():
            src, out = os.path.join(tmp, name + '.drawio'), os.path.join(tmp, name + '.svg')
            open(src, 'w').write(d.xml())
            # --theme light keeps colours literal (auto wraps them in light-dark()); fonts are inlined below.
            subprocess.run(['drawio', '-x', '-f', 'svg', '-t', '-b', '8', '--theme', 'light', '--embed-svg-fonts', 'false', '-o', out, src],
                           check=True, capture_output=True)
            svgs[name] = open(out).read()
    style = font_css(svgs.values())
    os.makedirs(OUT, exist_ok=True)
    for name, svg in svgs.items():
        svg = re.sub(r'(<svg[^>]*>)', r'\1' + style.replace('\\', r'\\'), svg, count=1)
        open(os.path.join(OUT, name + '.svg'), 'w').write(svg)
        print('wrote', name + '.svg')


if __name__ == '__main__':
    main()
