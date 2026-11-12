"""Aangan hero film: a 14 s cinematic edit built from the studio's existing
representational stills. Sub-pixel camera moves (PIL affine, bicubic),
in-frame crossfades, a gentle warm grade, vignette and film grain, piped
straight to ffmpeg. The last shot dissolves into the first frame so the
film loops seamlessly."""
import subprocess, sys
import numpy as np
from PIL import Image

SRC = "/mnt/user-data/uploads/aangan/src/assets/"
W, H = int(sys.argv[1]), int(sys.argv[2])
OUT = sys.argv[3]
FPS = 30
XF = 0.9  # crossfade seconds

# (file, seconds, start(cx,cy,zoom), end(cx,cy,zoom)) — centre as fraction of image, zoom = crop-width fraction
SHOTS = [
    ("hero-villa", 3.8, (0.50, 0.52, 1.00), (0.56, 0.50, 0.80)),  # establishing push-in at dusk
    ("property-delhi", 3.2, (0.40, 0.55, 0.86), (0.60, 0.55, 0.86)),  # lateral drift along the pool
    ("signature-residence", 3.2, (0.50, 0.62, 1.00), (0.50, 0.50, 0.92)),  # tilt up the verandah
    ("interior-courtyard", 3.2, (0.50, 0.60, 1.00), (0.50, 0.40, 0.84)),  # into the courtyard, up to the jaali
    ("material-travertine", 2.4, (0.45, 0.50, 0.62), (0.55, 0.45, 0.54)),  # stone close-up
    ("silent-bluehour", 3.4, (0.55, 0.55, 0.80), (0.48, 0.52, 0.98)),  # pull back at blue hour
]

def load(name):
    im = Image.open(SRC + name + ".jpg").convert("RGB")
    return im

def frame(im, cx, cy, z):
    iw, ih = im.size
    # crop box with output aspect; z is fraction of the max-fitting crop width
    max_w = min(iw, ih * W / H)
    cw = max_w * z
    ch = cw * H / W
    x0 = min(max(cx * iw - cw / 2, 0), iw - cw)
    y0 = min(max(cy * ih - ch / 2, 0), ih - ch)
    s = cw / W
    return im.transform((W, H), Image.AFFINE, (s, 0, x0, 0, s, y0), resample=Image.BICUBIC)

def ease(t):
    return t * t * (3 - 2 * t) * 0.6 + t * 0.4  # mostly linear, soft ends

ims = {n: load(n) for n, *_ in SHOTS}
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
vign = (1 - 0.32 * np.clip(d - 0.35, 0, None) ** 1.6)[..., None].astype(np.float32)
grade_m = np.array([1.03, 1.0, 0.94], np.float32)

def shot_frame(i, t):
    n, dur, a, b = SHOTS[i]
    k = ease(min(max(t / dur, 0), 1))
    p = [a[j] + (b[j] - a[j]) * k for j in range(3)]
    return np.asarray(frame(ims[n], *p), np.float32)

# timeline: shot i starts at sum(dur[:i]) - i*XF
starts = []
acc = 0.0
for i, s in enumerate(SHOTS):
    starts.append(acc)
    acc += s[1] - XF
total = acc + XF - XF  # last overlap is used by the loop dissolve
nf = int(round(total * FPS))
first = shot_frame(0, 0)

ff = subprocess.Popen([
    "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
    "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", sys.argv[4] if len(sys.argv) > 4 else "23",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", OUT,
], stdin=subprocess.PIPE)

for f in range(nf):
    t = f / FPS
    out = None
    for i, s in enumerate(SHOTS):
        lt = t - starts[i]
        if lt < 0 or lt > s[1]:
            continue
        fr = shot_frame(i, lt)
        if out is None:
            out = fr
        else:  # crossfade into shot i
            a = min(lt / XF, 1)
            a = a * a * (3 - 2 * a)
            out = out * (1 - a) + fr * a
    # loop dissolve: last XF seconds fade into the very first frame
    if t > total - XF:
        a = (t - (total - XF)) / XF
        a = a * a * (3 - 2 * a)
        out = out * (1 - a) + first * a
    # grade: warm, lifted blacks, slightly lowered contrast
    g = out * grade_m
    g = 12 + g * 0.93
    g = g * vign
    pass  # grain is added by CSS overlay on the page (keeps the file small)
    ff.stdin.write(np.clip(g, 0, 255).astype(np.uint8).tobytes())
    if f % 60 == 0:
        print(f, "/", nf, flush=True)
ff.stdin.close()
ff.wait()
print("done", total)
