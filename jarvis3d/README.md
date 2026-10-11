# Boro AIOS — de la idea a la acción

Public presentation: https://angelszs.site/jarvis3d/. Renamed from Jarvis by Ángel on 2026-10-11; existing URL retained. Static HTML/CSS/JS; GitHub Pages publishes the portfolio repository.

## Current experience

- Original logo, six-view reference, poster and supplied 9.9-second 1280×720 H.264/AAC film remain unchanged.
- `assets/boro-constructor.png`: identity-preserving image generated with the built-in image tool from Ángel's six-view reference. Detailed fur, glasses, graphite/silver armor, cyan seams, paddle tail and an extended construction hand. Original generated file is also preserved in the private media library.
- `scene.js`: hybrid composition. The beaver is a transparent rendered cutout facing the camera, with subtle animated posture; it is **not a volumetric or skeletal character rig**. The brain, convolutions, neurons, connections, workbench and holographic outputs are actual Three.js geometry. Pointer drag changes their perspective.
- Six illustrated capabilities: memory, search, documents, files, computer and processes. Each updates the brain's active region, output cards and readable request/result copy. Nodes assemble from the hand into the active region; particles connect hand and brain. Automatic 7-second stages; manual selection holds for 24 seconds of visible animation time.
- Pause, reduced-motion default, offscreen/background suspension, texture-failure/context-loss fallback. Capability buttons also work without WebGL. Mobile output labels use readable HTML instead of tiny canvas labels.
- Continuous seamless right-to-left marquee with separate accessible pause control and reduced-motion handling.
- The manifesto explicitly declares light foreground colors for its dark background; do not inherit the old light-theme foregrounds.

The animation illustrates possibilities; it does not execute tasks. Commercial scope remains an accompanied Personal pilot and a custom Empresa implementation. Contact only prepares a WhatsApp message for the visitor to review and send.

## Validation and rollback

Preview: `python3 -m http.server 8768` from repository root, open `/jarvis3d/`.

Check at 360/390/768/1440 px: overflow, images, navigation, six capability buttons, automatic cycle, drag, pause, reduced motion, no-WebGL fallback, marquee direction and pause, computed text contrast, video playback, original example tabs and contact preparation without sending. Real Safari/iPhone remains a separate acceptance test.

Revert the brain-workshop revision commit and republish Pages to restore `ac0840a`. All application runtimes, the film and other portfolio pages are out of scope and unchanged.
