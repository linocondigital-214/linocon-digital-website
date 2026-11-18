# Homepage background video

`scene.html` draws one frame of the loop on a canvas (`draw(p)`, p from 0 to 1, so frame 0 and the last frame join up seamlessly). `render.mjs` saves 300 frames (10 s at 30 fps) to `frames/` with Playwright, then:

```
ffmpeg -framerate 30 -i frames/f%04d.png -vf scale=1600:900 -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p -movflags +faststart -an public/videos/hero-1600.mp4
ffmpeg -framerate 30 -i frames/f%04d.png -vf scale=960:540  -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p -movflags +faststart -an public/videos/hero-960.mp4
ffmpeg -i frames/f0000.png -c:v libwebp -quality 70 public/videos/hero-poster-1920.webp
ffmpeg -i frames/f0000.png -vf scale=960:540 -c:v libwebp -quality 70 public/videos/hero-poster-960.webp
```
