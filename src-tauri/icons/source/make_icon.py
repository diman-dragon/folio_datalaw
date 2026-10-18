# Generates the app icon: a parchment scroll lit by a flashlight beam. Run: python3 make_icon.py (needs Pillow).
import math
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance

S = 1024
def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def vgrad(w, h, top, bot):
    g = Image.new('RGB', (1, h))
    for y in range(h): g.putpixel((0, y), lerp(top, bot, y / max(1, h - 1)))
    return g.resize((w, h))
def hgrad(w, h, stops):
    g = Image.new('RGB', (w, 1))
    for x in range(w):
        t = x / max(1, w - 1) * (len(stops) - 1); i = min(int(t), len(stops) - 2)
        g.putpixel((x, 0), lerp(stops[i], stops[i + 1], t - i))
    return g.resize((w, h))
def rmask(size, box, r):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle(box, r, fill=255); return m

# ---- background
bg = vgrad(S, S, (22, 40, 70), (9, 16, 30)).convert('RGBA')
bg.putalpha(rmask((S, S), (0, 0, S - 1, S - 1), 228))

# ---- scroll (drawn upright on its own layer, then rotated)
W, H = 640, 760
sc = Image.new('RGBA', (W, H), (0, 0, 0, 0))
sheet = hgrad(430, 560, [(205, 170, 112), (243, 226, 184), (250, 238, 203), (243, 226, 184), (205, 170, 112)])
sc.paste(sheet, (105, 100))
d = ImageDraw.Draw(sc)
ink = (96, 66, 38)
d.rounded_rectangle((165, 175, 495, 197), 11, fill=ink)                 # title line
for i, (y, w) in enumerate([(245, 360), (290, 330), (335, 360), (380, 300), (425, 350), (470, 320), (515, 240)]):
    d.rounded_rectangle((165, y, 165 + w, y + 14), 7, fill=(120, 88, 58))
for cy in (100, 660):                                                   # rolls
    roll = hgrad(560, 110, [(150, 108, 64), (214, 170, 104), (236, 200, 132), (200, 154, 92), (130, 90, 52)])
    roll = Image.merge('RGB', roll.split())
    m = rmask((560, 110), (0, 0, 559, 109), 55)
    sc.paste(roll, (40, cy - 55 + (0 if cy == 100 else 0)), m)
    d.ellipse((24, cy - 62, 96, cy + 62), fill=(120, 82, 46)); d.ellipse((44, cy - 42, 80, cy + 42), fill=(80, 52, 28))
    d.ellipse((544, cy - 62, 616, cy + 62), fill=(120, 82, 46)); d.ellipse((560, cy - 42, 596, cy + 42), fill=(80, 52, 28))
sc = sc.rotate(7, resample=Image.BICUBIC, expand=True)
canvas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
canvas.paste(sc, (330, 70), sc)
scroll_shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
scroll_shadow.paste((0, 0, 0, 140), (0, 0), canvas.split()[3].filter(ImageFilter.GaussianBlur(26)))
scene = Image.alpha_composite(bg, ImageChops.offset(scroll_shadow, 14, 24))

# ---- beam: from the lens (lx, ly) fanning out to the upper right
lx, ly = 300, 735
ang = math.radians(-38)
beam_mask = Image.new('L', (S, S), 0)
bd = ImageDraw.Draw(beam_mask)
L, spread = 1100, math.radians(21)
pts = [(lx, ly)] + [(lx + L * math.cos(ang + a), ly + L * math.sin(ang + a)) for a in (-spread, spread)]
bd.polygon(pts, fill=255)
beam_mask = beam_mask.filter(ImageFilter.GaussianBlur(22))
fall = Image.new('L', (S, S), 0)
for y in range(S):
    for x in range(0, S, 4):
        dist = math.hypot(x - lx, y - ly)
        v = max(0.0, 1 - dist / 1050) ** 0.8
        fall.paste(int(255 * v), (x, y, x + 4, y + 1))
beam_alpha = ImageChops.multiply(beam_mask, fall)

# darken the scroll outside the beam, keep it bright inside
dark = ImageEnhance.Brightness(canvas).enhance(0.38)
lit = Image.composite(canvas, dark, beam_mask.filter(ImageFilter.GaussianBlur(10)))
lit.putalpha(canvas.split()[3])
scene = Image.alpha_composite(scene, lit)
glow = Image.new('RGBA', (S, S), (255, 236, 160, 0)); glow.putalpha(beam_alpha.point(lambda v: int(v * 0.42)))
scene = Image.alpha_composite(scene, glow)

# ---- flashlight (drawn upright, pointing up, rotated to the beam direction)
FW, FH = 240, 520
fl = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); fd = ImageDraw.Draw(fl)
body = hgrad(130, 340, [(34, 42, 56), (88, 100, 120), (46, 54, 70), (22, 28, 40)])
fl.paste(body, (55, 160), rmask((130, 340), (0, 0, 129, 339), 26))
for y in (215, 245, 275):                                              # grip rings
    fd.rounded_rectangle((55, y, 185, y + 10), 5, fill=(120, 134, 158))
fd.rounded_rectangle((100, 395, 140, 430), 10, fill=(214, 70, 60))     # switch
head = Image.new('L', (FW, FH), 0); hd = ImageDraw.Draw(head)
hd.polygon([(62, 170), (178, 170), (225, 40), (15, 40)], fill=255)
hd.rounded_rectangle((8, 20, 232, 56), 14, fill=255)
fl.paste(hgrad(FW, FH, [(150, 160, 178), (226, 232, 242), (170, 180, 198)]), (0, 0), head)
fd.ellipse((30, 22, 210, 62), fill=(255, 250, 214))                   # lens
fd.ellipse((60, 28, 180, 56), fill=(255, 255, 240))
fl = fl.rotate(-(90 - 38) + 0, resample=Image.BICUBIC, expand=True, center=(FW // 2, 42))
lensx, lensy = lx, ly
fl_rot = fl
scene.alpha_composite(fl_rot, (int(lensx - 130), int(lensy - 70)))
halo = Image.new('RGBA', (S, S), (0, 0, 0, 0)); hd2 = ImageDraw.Draw(halo)
hd2.ellipse((lx - 70, ly - 70, lx + 70, ly + 70), fill=(255, 244, 190, 210))
scene = Image.alpha_composite(scene, halo.filter(ImageFilter.GaussianBlur(28)))

# ---- crop to the rounded square and save
out = Image.new('RGBA', (S, S), (0, 0, 0, 0)); out.paste(scene, (0, 0), bg.split()[3])
out.save('icon-1024.png')
print('ok')
