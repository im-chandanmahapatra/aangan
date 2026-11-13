# Aangan hero film

## What ships now

`public/v2/film/aangan-film-{1080,720}.mp4` (H.264, 30 fps, 13.8 s, seamless loop, no audio; 4.2 MB / 2.2 MB) and `aangan-film-poster.webp`.

No video-generation model was available in the build environment, so this is **not generated footage**. `render.py` edits six of the studio's existing representational renders (`src/assets/*.jpg`) into a film: sub-pixel camera moves (push-in, lateral drift, tilt), 0.9 s dissolves, a warm low-contrast grade and a vignette. Film grain is added on the page by CSS. The site captions it: _"Film edited from the studio's representational renders — not footage of a listing."_

Re-render: `python3 render.py 1920 1080 out.mp4 25` (needs numpy, Pillow, ffmpeg).

## Prompt for a real generated film (when a video model is available)

Use for Veo / Sora / Runway Gen-4 / Kling. Generate 3–4 clips of 5–8 s, 16:9, 24 fps, and cut them with dissolves.

> Photorealistic architectural film, 16:9, natural light, restrained warm grade, slow stabilised camera, no people, no text, no logos.
>
> 1. Golden-hour establishing shot: a slow aerial descent towards a low, single-storey courtyard house of laterite stone and lime plaster with terracotta-tile hip roofs, set in a tropical grove of mango, sal and coconut palms near Bhubaneswar, Odisha. Red earth paths, green hill contours beyond, palms moving gently in the monsoon breeze.
> 2. Eye-level dolly along a deep verandah with timber posts; long shadows; a still reflecting pool between two wings mirrors the sky.
> 3. Exterior-to-interior: the camera passes through a timber door into an open-to-sky courtyard; a frangipani tree; dappled light through a terracotta jaali moving slowly across a Kota-stone floor.
> 4. Macro detail: hand-finished laterite, oiled teak grain, lime plaster texture, raindrops beginning to fall into the courtyard pool as monsoon clouds gather.
>    Negative: CGI look, morphing or warping buildings, impossible geometry, lens flares, oversaturation, fast moves, drone shake, people, text, watermarks.

Treat any generated clip as **conceptual brand imagery**, never as a listed property, and keep the caption.
