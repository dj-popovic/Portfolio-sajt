"""Builds every klin logo asset: the wordmark's geometry for <Logo>, the outlined SVG files,
the tab icon and the PNG icons.

The letters k, l, n are Unbounded 700's own outlines (from the site's font, instanced at
wght 700), set with -0.02em tracking (Unbounded has no kerning between them). The i is a
wedge: its top on the x-height, 1.25x the stem wide (a wedge carries less ink than a stem,
so it's a touch wider to weigh the same), slightly rounded top corners, a sharp point on
the baseline; its dot is round, as wide as the stem, centred where Unbounded's i-dot sits.

usage (after `npm run build`, which puts the site's Unbounded file in .next/static/media):
  python3 -m venv .venv && .venv/bin/pip install fonttools brotli
  .venv/bin/python scripts/logo/build.py

writes src/components/brand/logo-geometry.ts, public/brand/*, src/app/icon.svg,
src/app/favicon.ico (16 snapped to the pixel grid, 32, 48) and src/app/apple-icon.png.
"""

import glob
import io
import json
import math
import os
import shutil
import struct
import subprocess
import tempfile

from fontTools.pens.statisticsPen import StatisticsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# the proportions (font units, UPM 1000): wedge top width, dot diameter, corner radius,
# and the light variant's outline round the dot (drawn inside its edge)
W, D, R, RING = 255.0, 210.0, 18.0, 18.0
DOT_CY = 726.0  # the centre of Unbounded 700's i-dot
TRACK = -20  # -0.02em
# the palette's values (the site itself uses the CSS tokens)
WHITE, LIME, BLUE, BG = "#FFFFFF", "#D5FB09", "#040273", "#08080F"


def fmt(v):
    return ("%.1f" % v).rstrip("0").rstrip(".")


def load_font():
    """The site's Unbounded (latin, variable) from the build, instanced at weight 700."""
    for f in sorted(glob.glob(f"{REPO}/.next/static/media/*.woff2")):
        t = TTFont(f)
        name = t["name"].getDebugName(1) or ""
        cmap = t.getBestCmap() or {}
        if "Unbounded" in name and all(ord(c) in cmap for c in "klin"):
            if "fvar" not in t:
                return t
            # a real font file at 700: saving rounds the outlines to whole units, as any
            # static instance (and the committed geometry) has them
            buf = io.BytesIO()
            instantiateVariableFont(t, {"wght": 700}).save(buf)
            buf.seek(0)
            return TTFont(buf)
    raise SystemExit("Unbounded not found in .next/static/media: run `npm run build` first")


FONT = load_font()
GS, CMAP, HMTX = FONT.getGlyphSet(), FONT.getBestCmap(), FONT["hmtx"]
XH = FONT["OS/2"].sxHeight


def adv(ch):
    return HMTX[CMAP[ord(ch)]][0]


def outline(ch, dx, baseline):
    """A glyph as SVG path data, moved by dx and flipped so its baseline sits at y=baseline."""
    pen = SVGPathPen(GS, ntos=fmt)
    GS[CMAP[ord(ch)]].draw(TransformPen(pen, (1, 0, 0, -1, dx, baseline)))
    return pen.getCommands()


def wedge_d(cx, y_top, y_tip, width, r):
    """A wedge (SVG coordinates, y down): a flat top `width` wide with its corners rounded
    over `r` along each edge, tapering to a sharp point at (cx, y_tip)."""
    tl, tr, tip = (cx - width / 2, y_top), (cx + width / 2, y_top), (cx, y_tip)

    def along(p, q, d):
        n = math.hypot(q[0] - p[0], q[1] - p[1])
        return (p[0] + (q[0] - p[0]) * d / n, p[1] + (q[1] - p[1]) * d / n)

    a1, a2 = (tl[0] + r, y_top), (tr[0] - r, y_top)
    b2, b1 = along(tr, tip, r), along(tl, tip, r)

    def P(p):
        return f"{fmt(p[0])} {fmt(p[1])}"

    return f"M{P(a1)}H{fmt(a2[0])}Q{P(tr)} {P(b2)}L{P(tip)}L{P(b1)}Q{P(tl)} {P(a1)}Z"


# ---- the wordmark: pen positions, then everything shifted so the box starts at k's ink
xk = 0
xl = xk + adv("k") + TRACK
xi = xl + adv("l") + TRACK
xn = xi + adv("i") + TRACK
left = 56  # k's left side bearing in Unbounded 700
right = xn + 740  # n's right ink edge
cx = xi + 158.5 - left  # the i's stem centre
H = max(770, DOT_CY + D / 2)  # the dot's top is the wordmark's top; the baseline is at y=H
sx = -left
letters = outline("k", xk + sx, H) + outline("l", xl + sx, H) + outline("n", xn + sx, H)
wedge = wedge_d(cx, H - XH, H, W, R)
dot = {"cx": cx, "cy": H - DOT_CY, "r": D / 2}
w = right - left


def ink_centre():
    """The wordmark's centre of mass, from the top, as a share of its height. In a pill or a
    button that is the point to centre (the box's own middle is higher: the dot stands above
    the letters and nothing hangs below the baseline, so the box alone sits it low)."""
    area = moment = 0.0
    for ch in "kln":
        pen = StatisticsPen(GS)
        GS[CMAP[ord(ch)]].draw(pen)
        a = abs(pen.area)
        area += a
        moment += a * pen.meanY
    tri = W * XH / 2  # the wedge, near enough a triangle: its centre is a third of the way down
    area += tri
    moment += tri * XH * 2 / 3
    disc = math.pi * (D / 2) ** 2
    area += disc
    moment += disc * DOT_CY
    return 1 - moment / area / H


def wordmark(ink, wedge_fill, dot_fill, ring=None):
    ring_el = (
        f'<circle cx="{fmt(dot["cx"])}" cy="{fmt(dot["cy"])}" r="{fmt(dot["r"] - RING / 2)}" fill="none" stroke="{ring}" stroke-width="{fmt(RING)}"/>'
        if ring
        else ""
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(H)}" role="img" aria-label="klin">'
        f"<title>klin</title>"
        f'<path fill="{ink}" d="{letters}"/>'
        f'<path fill="{wedge_fill}" d="{wedge}"/>'
        f'<circle cx="{fmt(dot["cx"])}" cy="{fmt(dot["cy"])}" r="{fmt(dot["r"])}" fill="{dot_fill}"/>'
        f"{ring_el}</svg>\n"
    )


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


write(f"{REPO}/public/brand/logo-dark.svg", wordmark(WHITE, LIME, LIME))
write(f"{REPO}/public/brand/logo-light.svg", wordmark(BLUE, BLUE, LIME, ring=BLUE))
write(f"{REPO}/public/brand/logo-mono.svg", wordmark("currentColor", "currentColor", "currentColor"))


# ---- the mark: the wedge i alone, on a square of the page's dark
def mark_svg(size, radius, mark_h, full_bleed=False):
    """The i at its true proportions, `mark_h` tall, centred (a touch low: its weight sits high)."""
    s = mark_h / H
    ox, oy = (size - W * s) / 2, (size - mark_h) / 2 + 0.03 * size
    mcx = W / 2 * s + ox
    d = wedge_d(mcx, (H - XH) * s + oy, H * s + oy, W * s, R * s)
    corner = "" if full_bleed else f' rx="{fmt(radius)}"'
    rect = f'<rect width="{size}" height="{size}"{corner} fill="{BG}"/>'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">{rect}'
        f'<path fill="{LIME}" d="{d}"/>'
        f'<circle cx="{fmt(mcx)}" cy="{fmt(dot["cy"] * s + oy)}" r="{fmt(dot["r"] * s)}" fill="{LIME}"/></svg>\n'
    )


def tab_icon_svg():
    """The tab icon: the mark a touch bolder (bigger dot, wider wedge, a whole pixel's gap at
    16px), as small-size versions of a mark usually are; on a 64 grid."""
    d, gap, wh, ww = 12.8, 3.84, 28.5, 16.6
    top = (64 - (d + gap + wh)) / 2 + 1.9
    wt = top + d + gap
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{BG}"/>'
        f'<path fill="{LIME}" d="{wedge_d(32, wt, wt + wh, ww, 1.1)}"/>'
        f'<circle cx="32" cy="{fmt(top + d / 2)}" r="{fmt(d / 2)}" fill="{LIME}"/></svg>\n'
    )


# 16px, snapped to the pixel grid by hand (the vector at 16px blurs the dot into the wedge)
ICON_16 = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3.5" fill="{BG}"/>'
    f'<path fill="{LIME}" d="{wedge_d(8, 7, 14.5, 5, 0.35)}"/>'
    f'<circle cx="8" cy="4" r="1.75" fill="{LIME}"/></svg>\n'
)

write(f"{REPO}/public/brand/mark.svg", mark_svg(64, 14, 40))
write(f"{REPO}/src/app/icon.svg", tab_icon_svg())

# ---- the PNGs, rendered by the browser the site is tested in
tmp = tempfile.mkdtemp()
sources = {
    "tab": tab_icon_svg(),
    "16": ICON_16,
    "any": mark_svg(64, 14, 40),
    "apple": mark_svg(180, 0, 112, full_bleed=True),  # iOS rounds it itself
    "maskable": mark_svg(512, 0, 250, full_bleed=True),  # inside the 80% safe zone
}
for k, v in sources.items():
    write(f"{tmp}/{k}.svg", v)
jobs = [
    ("16", 16, "f16.png"),
    ("tab", 32, "f32.png"),
    ("tab", 48, "f48.png"),
    ("apple", 180, "apple-icon.png"),
    ("any", 192, "icon-192.png"),
    ("any", 512, "icon-512.png"),
    ("maskable", 512, "icon-maskable-512.png"),
]
args = [x for src, size, out in jobs for x in (f"{tmp}/{src}.svg", str(size), f"{tmp}/{out}")]
subprocess.run(["node", f"{REPO}/scripts/logo/icons.mjs", *args], check=True)

# favicon.ico: each size its own PNG (not one image scaled)
pngs = [open(f"{tmp}/{f}", "rb").read() for f in ("f16.png", "f32.png", "f48.png")]
ico = io.BytesIO()
ico.write(struct.pack("<HHH", 0, 1, len(pngs)))
offset = 6 + 16 * len(pngs)
for size, data in zip((16, 32, 48), pngs):
    ico.write(struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32, len(data), offset))
    offset += len(data)
for data in pngs:
    ico.write(data)
open(f"{REPO}/src/app/favicon.ico", "wb").write(ico.getvalue())
shutil.copy(f"{tmp}/apple-icon.png", f"{REPO}/src/app/apple-icon.png")
for f in ("icon-192.png", "icon-512.png", "icon-maskable-512.png"):
    shutil.copy(f"{tmp}/{f}", f"{REPO}/public/brand/{f}")

# ---- the component's data
data = {
    "width": w,
    "height": H,
    "letters": letters,
    "wedge": wedge,
    "dot": {k: round(v, 1) for k, v in dot.items()},
    "wedgeTop": W,
    "ring": RING,
    "inkCentre": round(ink_centre(), 3),
}
write(
    f"{REPO}/src/components/brand/logo-geometry.ts",
    "// Generated by scripts/logo/build.py (Unbounded 700 outlines + the wedge): don't edit by hand.\n"
    "// The wordmark \"klin\" in font units (UPM 1000), its box from k's left edge to n's right edge\n"
    "// and from the dot's top to the baseline. The i is a wedge (top on the x-height, point on the\n"
    "// baseline) and a dot where Unbounded's i-dot sits. inkCentre is its centre of mass, from the\n"
    "// top, as a share of the height: the point to centre in a pill (the box's middle is higher).\n"
    f"export const LOGO = {json.dumps(data, indent=2)} as const;\n",
)
print(f"klin: {fmt(w)} x {fmt(H)} units; wedge {fmt(W)}, dot {fmt(D)}; files written")
