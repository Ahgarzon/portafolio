# Boro AIOS — de la idea a la acción

Public presentation at https://angelszs.site/jarvis3d/, renamed from Jarvis by Ángel on 2026-10-11. The existing path is retained so shared links continue to work. Static HTML/CSS/JS; published through the portfolio repository's GitHub Pages configuration.

## Assets and experience

- `assets/boro-logo.jpg` and `assets/boro-reference.jpg`: original supplied brand artwork, unchanged.
- `assets/boro-film.mp4`: original supplied 9.9-second 1280×720 H.264/AAC film, unchanged. Loaded only on playback; native controls, sound under visitor control, downloadable.
- `assets/boro-poster.jpg`: still extracted from that film.
- `scene.js`: original procedural Three.js beaver in a metallic suit with articulated arms, glasses, teeth and a textured geometric tail. A stylized interpretation, not a photoreal reconstruction or imported rig.
- Three construction stages cycle while visible; selecting a stage holds it for 24 seconds of active animation time. Drag rotates the workshop. Manual pause, reduced-motion default, offscreen/background suspension and static fallback.

Commercial scope remains an accompanied Personal pilot and a custom Empresa implementation. Contact prepares a WhatsApp message; it never sends it or saves form contents.

## Verification and rollback

2026-10-11: Chromium at 360, 390, 768 and 1440 px: no horizontal overflow, loaded images, responsive navigation, accessible example tabs, questions, plan choice and WhatsApp URL preparation without sending. WebGL construction, pause, reduced motion, unavailable-WebGL fallback and actual MP4 playback tested. No physical iPhone/Safari or mobile GPU performance certification.

Local preview: from repository root, `python3 -m http.server 8767`, then `/jarvis3d/`.

Revert the Boro presentation commit and republish Pages to restore the preceding Jarvis version. Changes are confined to `jarvis3d/`; application runtimes and other portfolio pages are separate.
