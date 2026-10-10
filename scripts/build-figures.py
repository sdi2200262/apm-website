# Builds the thesis's data charts into static/img/figures/ as <name>-<theme>.svg, theme light or dark.
# Run with the thesis's Python (it has matplotlib):
#   <thesis>/.venv/bin/python scripts/build-figures.py <thesis checkout>
# Runs the thesis's own analysis/ figure scripts, unchanged, on its local cohort config (the participant data
# is only on the author's machine, so the output is committed). Only the look changes: Literata, text as paths,
# SVG out. The thesis draws in black, white and greys, so each grey is remapped onto the ink-paper scale of a
# theme (black = ink, white = paper). Figures keep their thesis file names, so the thesis reader maps them by name.
import importlib
import os
import re
import subprocess
import sys
import tempfile

import matplotlib as mpl
import matplotlib.font_manager as fm
from matplotlib.figure import Figure

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'static', 'img', 'figures')
SCRIPTS = ('economic_figures', 'process_figures', 'functional_figures', 'occupancy_figures',
           'functional_compact_figure', 'cost_score_figure')
diagrams = importlib.import_module('build-diagrams')  # THEMES and the Literata download, shared with the diagrams


def themed(svg, t):
    # matplotlib leaves black fills unset (SVG's default), so set black on the root first; then each
    # #vvvvvv grey -> the same point between ink (v = 0) and paper (v = 255).
    svg = svg.replace('<svg ', '<svg fill="#000000" ', 1)
    ink, paper = (tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in (t['ink'], t['paper']))
    def mix(m):
        v = int(m.group(1), 16) / 255
        return '#' + ''.join(f'{round(a + (b - a) * v):02x}' for a, b in zip(ink, paper))
    return re.sub(r'#([0-9a-fA-F]{2})\1\1\b', mix, svg)


def main():
    thesis = os.path.abspath(sys.argv[1])
    config = os.path.join(thesis, 'analysis', 'config', 'cohort.local.json')
    # analysis.style needs the thesis's Latin Modern faces at import; Literata replaces them below.
    os.environ['THESIS_LM_FONT_DIR'] = os.path.dirname(subprocess.run(
        ['kpsewhich', 'lmroman10-regular.otf'], check=True, capture_output=True, text=True).stdout.strip())
    sys.path.insert(0, thesis)
    importlib.import_module('analysis.style')
    with tempfile.TemporaryDirectory() as tmp:
        for path in diagrams.literata_ttf(tmp).values():
            fm.fontManager.addfont(path)
        mpl.rcParams.update({'font.serif': [diagrams.FONT], 'svg.fonttype': 'path', 'svg.hashsalt': 'apm'})
        # Every script saves <name>.pdf under the output root; save SVG instead, keyed by name.
        svgs, save = {}, Figure.savefig
        def savefig(fig, output, **kw):
            path = os.path.join(tmp, os.path.basename(str(output)).removesuffix('.pdf') + '.svg')
            save(fig, path, transparent=True, metadata={'Date': None}, **kw)
            svgs[os.path.basename(path).removesuffix('.svg')] = open(path).read()
        Figure.savefig = savefig
        for name in SCRIPTS:
            if importlib.import_module(f'analysis.{name}').main(['--config', config, '--output-dir', tmp]):
                raise SystemExit(f'{name} failed')
    os.makedirs(OUT, exist_ok=True)
    for name, svg in sorted(svgs.items()):
        for theme, t in diagrams.THEMES.items():
            open(os.path.join(OUT, f'{name}-{theme}.svg'), 'w').write(themed(svg, t))
            print('wrote', f'{name}-{theme}.svg')


if __name__ == '__main__':
    main()
