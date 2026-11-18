# Homepage background videos

Two original loops, both 10 s at 30 fps:

- `hero-scene.html` → `hero-*` (top of the homepage): flowing blue-to-orange light.
- `found-scene.html` → `found-*` (behind "Most small business websites look fine and sell nothing…"): a dark field of grey dots (sites nobody finds) that brand-coloured signals light up one by one.

Each scene draws one frame with `draw(p)`, p from 0 to 1, so the first and last frames join up seamlessly. From this folder, `node render.mjs 300 found-scene.html` saves 300 frames to `frames/`, then (swap `found` for `hero` as needed):

```
ffmpeg -framerate 30 -i frames/f%04d.png -vf scale=1600:900 -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p -movflags +faststart -an ../../public/videos/found-1600.mp4
ffmpeg -framerate 30 -i frames/f%04d.png -vf scale=960:540  -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p -movflags +faststart -an ../../public/videos/found-960.mp4
ffmpeg -i frames/f0135.png -c:v libwebp -quality 70 ../../public/videos/found-poster-1920.webp
ffmpeg -i frames/f0135.png -vf scale=960:540 -c:v libwebp -quality 70 ../../public/videos/found-poster-960.webp
```

The hero poster uses frame `f0000.png`. `frames/` is scratch: don't commit it.

## Process cards (Audit, Plan, Build & launch, Grow)

`process-scene.html?s=audit|plan|build|grow`, 8 s loops at 1040×840 (the card's shape; the picture sits bottom right, under the card's text fade). From this folder, `node render-process.mjs audit` saves 240 frames to `frames-audit/`, then:

```
ffmpeg -framerate 30 -i frames-audit/f%04d.png -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p -movflags +faststart -an ../../public/videos/process-audit-1040.mp4
ffmpeg -framerate 30 -i frames-audit/f%04d.png -vf scale=600:484 -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p -movflags +faststart -an ../../public/videos/process-audit-600.mp4
ffmpeg -i frames-audit/f0170.png -c:v libwebp -quality 72 ../../public/videos/process-audit-poster-1040.webp
ffmpeg -i frames-audit/f0170.png -vf scale=600:484 -c:v libwebp -quality 72 ../../public/videos/process-audit-poster-600.webp
```

The old card photos (`public/images/process-*-1040/600.webp`) are kept in case they're wanted back.
