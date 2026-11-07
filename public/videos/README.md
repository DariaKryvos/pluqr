# Product footage

`oliebol-slicing.mp4` is the supplied 5.04-second 1920 × 1080 slicing video, copied without modification. `oliebol-slicing-poster.webp` is its opening frame.

No autoplay: ScrollTrigger seeks the video directly. Pass `videoSrc` to `ScrollExperience` to change the path.

`pluqr-dark-plate-story-clear.webm` (VP9 + alpha) and `pluqr-dark-plate-story-clear.mov` (HEVC + alpha, for Safari) are `pluqr-dark-plate-story.mp4` with the green background keyed out and the KlingAI watermark masked. The key is an RGB green-excess matte — `alpha = clip((16 - (G - max(R,B))) / 8)` — because the background is too dark for YUV chromakey without eating the black plate. WebM keyframe interval is 4 frames for smooth scroll seeking.
