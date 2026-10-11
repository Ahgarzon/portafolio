# Boro AIOS — de la idea a la acción

Public presentation: https://angelszs.site/boroaios/. Renamed from Jarvis by Ángel on 2026-10-11; old URL redirects to the new path. Static HTML/CSS/JS; GitHub Pages publishes the portfolio repository.

## Current experience

- Original logo, six-view reference, poster and supplied 9.9-second 1280×720 H.264/AAC film remain unchanged.
- `assets/boro-constructor.png`: identity-preserving image generated with the built-in image tool from Ángel's six-view reference. Detailed fur, glasses, graphite/silver armor, cyan seams, paddle tail and an extended construction hand. Original generated file is also preserved in the private media library.
- `scene.js` + `character-motion.js`: hybrid composition. The original transparent render is a subdivided **2.5D articulated mesh**, not a volumetric mascot reconstructed from the reference sheet. Independent soft-weighted arm/forearm, head, tail and resting-arm motion preserve the detailed artwork; boots stay grounded. The same deformation locates the palm's particle/beam source, so it follows the hand. The brain, folds, neurons, connections, floor conduits, plinth and light rings are actual Three.js geometry. Pointer drag changes their perspective.
- Six illustrated capabilities: memory, digital projects (webs/apps/tools), documents, campaigns, computer and automation. Each updates the brain's active region, output cards and readable request/result copy. An 8-second observe → reach → connect → review loop plays without scrolling; manual selection holds for 24 seconds of visible animation time. Neurons and neural paths are batched into one draw call each. Original images/logo/video are unchanged.
- Pause, reduced-motion default, offscreen/background suspension, texture-failure/context-loss fallback. Capability buttons also work without WebGL. Mobile output labels use readable HTML instead of tiny canvas labels.
- Continuous seamless right-to-left marquee with separate accessible pause control and reduced-motion handling.
- The manifesto explicitly declares light foreground colors for its dark background; do not inherit the old light-theme foregrounds.

The animation illustrates possibilities; it does not execute tasks. Commercial scope remains an accompanied Personal pilot and a custom Empresa implementation. Contact only prepares a WhatsApp message for the visitor to review and send.

## Validation and rollback

Preview: `python3 -m http.server 8768` from repository root, open `/boroaios/`.

Check at 360/390/768/1440 px: overflow, images, navigation, six capability buttons, automatic cycle, drag, pause, reduced motion, no-WebGL fallback, marquee direction and pause, computed text contrast, video playback, original example tabs and contact preparation without sending. Real Safari/iPhone remains a separate acceptance test.

Movement regressions: `node --test boroaios/tests/character-motion.test.mjs`. Browser suite: set `BORO_NODE_MODULES` to an installed directory containing `playwright` and `sharp`, then run `node boroaios/tests/browser-qa.cjs http://127.0.0.1:8771/boroaios/ <report-directory>`. Chrome must be installed. Reports/screenshots are generated outside the source tree. Tests never send WhatsApp messages or modify application runtimes. Check all six autonomous chapters, paused drag, reentry, context loss, accessible static controls and the mascot's full tail in both narrow and tablet layouts.

Current rollback: revert the builder-motion revision and republish Pages to restore `a92ca2f`. Copy now includes websites, applications and business/project tools, with agreed scope and human publication approval; it does not claim universal or already-validated application execution.

Revert the brain-workshop revision commit and republish Pages to restore `ac0840a`. All application runtimes, the film and other portfolio pages are out of scope and unchanged.
