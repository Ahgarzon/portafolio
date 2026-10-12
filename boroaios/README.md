# Boro AIOS — de la idea a la acción

Public presentation: https://angelszs.site/boroaios/. Renamed from Jarvis by Ángel on 2026-10-11; old URL redirects to the new path. Static HTML/CSS/JS; GitHub Pages publishes the portfolio repository.

## Current experience — animated workstation V11

Release `constructor11-20261012` retains the corrected V10 character unchanged. The talking mouth now clones its material before enabling opacity: the source asset shares the former pupil material with the mouth, so hiding the redundant pupils had also hidden the mouth. Its bounded chin morph opens behind, not over, the two unchanged incisors. The public animation regression now checks actual material visibility in addition to the audio envelope. No model/voice-provider change or microphone capture.

Release `constructor10-20261012` makes the scene itself the interaction. The large template form and rigid visitor are no longer mounted; their old modules remain only for rollback. Drag the real idea piece to the monitor (mouse/touch), activate it with a keyboard, touch Boro to greet or the monitor to build, or use the equivalent Construir/Saludar buttons. The native body/hand/head respond, and the brain builds inside the computer. A wider framing and darker workstation leave the character readable on phones.

Escuchar a Boro plays a generated male Spanish introduction only after a user gesture. Its actual decoded waveform drives the same native chin/mouth as the authenticated application. There is no microphone, recording, public AI request or private-owner session in this demonstration. Audio stops when the scene leaves the screen or the page is hidden; voice and six capability controls remain available without WebGL. The application link opens the separate authenticated Boro for actual conversations.

V10 corrects the native eye surface as well as the previously added optics: local native protrusions are flattened, the duplicated cyan halo is subdued with vertex colors, and a dark pupil lives on the iris surface rather than intersecting reflective spheres. Textures, reference, glasses, body, skeleton and baked animation are preserved. `tools/soften-native-eyes.mjs` reproduces the change from immutable V7. No raster editing or different beaver. Visual inspection is not an assertion of pixel-exact fidelity or final owner acceptance.

Additive head/wrist gestures restore the previous native pose before each mixer sample. Without that baseline, Three's unchanged-track optimisation let rotations accumulate into an unnatural pose. The new regression repeats a frozen pose 150 times at each width and checks it cannot drift. `tests/animation-qa.cjs` covers direct touch/mouse delivery, greeting, actual audio/mouth, pause/reduced motion, no mic requests and offscreen stop; `workstation-qa.cjs` retains native geometry/cavity/failure/retry coverage. `eyes-v10.test.mjs` protects skeleton, animation, textures and all non-eye buffers. Historical form tests below are not the V10 acceptance suite.

### Previous direct manipulation V9

#### Direct manipulation V9 (2026-10-12)

Release `constructor9-20261012` integrates the published V8 visitor/plan without overwriting it. With an idea entered, the visitor's physical idea piece gains an accessible «Tu idea» handle. Drag it to the monitor with a mouse or touch, press Enter/Space on the handle, or use the form. Boro reuses his validated native gesture to receive it, transfer it into the monitor and build the brain. Checklist changes illuminate the corresponding four monitor markers and trigger a brief head response. The V7 character/eye GLB is unchanged.

The plan is available immediately, not gated on animation/loading. Pause/reduced motion delivers a static result; replay deliberately repeats the handoff without resetting edits/checks. Scene loss/retry preserves the in-memory plan/checklist and disposes old handles. Only the handle captures touch; the canvas retains vertical page scrolling. No visitor text leaves the page, and the UI explicitly calls this a guided template demo, not connected AI or PC execution.

`idea-scene.js` owns only the piece/handles and feedback pose. `tests/interaction-qa.cjs <baseURL> <report-directory>` checks desktop and mobile widths, keyboard, real browser touch events, drag/cancel, native response, edit/check/uncheck, the downloaded UTF-8 contents, no input transmission/storage, plain-text injection safety, reduced motion, no WebGL and loss/retry. Run alongside the native workstation regression suite and unit contracts. Physical Safari/iPhone remains separate acceptance. Revert V9 and republish Pages to restore the published V8 experience.

### Interactive workshop V8 (2026-10-12)

The V7 eye asset is preserved byte-for-byte. A separate articulated visitor represents the person bringing an idea to Boro. Its arms hand a visible idea into the monitor while Boro's existing native rig types and builds. Clicking the visitor opens the idea field; clicking Boro or the monitor opens the plan. Equivalent labelled HTML buttons are always available, with no need to discover 3D gestures.

The visitor can write an idea or choose an example, select one of six guided templates, edit four steps, check actual completed work and download a UTF-8 text plan. Four monitor pieces follow the exact checklist flags, including unchecking. Another idea starts a new plan without carrying over completion; the previous plan remains until replacement so a navigation action does not silently discard it. The scene illustrates the handoff; it does not pretend to call AI or execute tasks. Everything is local and ephemeral, with an explicit download-before-exit notice.

`idea-plan.js` is the single planning implementation; `idea-plan.mjs` re-exports it for compatibility. Browser imports use `.js` because this Windows preview server serves `.mjs` as text/plain. No visitor idea is inserted as HTML or transmitted. The form and result are mounted before WebGL starts and continue working if the model fails to load. Existing reduced-motion, pause, offscreen and context-loss behavior is retained.

Validation: `node --test boroaios/tests/idea-plan.test.mjs boroaios/tests/workshop-partner.test.mjs boroaios/tests/eyes-contract.test.mjs`; `node boroaios/tests/copy-qa.cjs`. Browser QA covers a 360px phone viewport and desktop, edit/download content, four checked steps, replacement reset, whitespace validation, pause and an isolated missing-model fallback. Real physical Safari/iPhone is still unverified. Revert the V8 PR and republish Pages to restore V7; no other portfolio pages or runtime services are changed.

Release `constructor7-20261012` corrects the V6 protruding-eye complaint: the same eye assembly is recessed, its depth reduced to 28%, width to 80%, height to 60%, and outward cant from 20° to 8°. A subdued dark eye surround replaces the bright spherical surround. The original native face, blue irises, glasses, skin weights, joint hierarchy and animation are retained. Extra eyelid rings/discs and an over-recessed candidate were visually rejected; they are not published. `tools/recess-eyes.mjs` reproduces the correction from the immutable V6 asset. `tests/eyes-qa.cjs` captures front, three-quarter and profile views/close-ups for visual review; `tests/eyes-contract.test.mjs` checks that non-eye geometry and articulation remain unchanged.

V6 replaced the hybrid mascot plane with a native GLB skin reconstructed from the owner's six-view artwork. Boro works at a physical keyboard, gestures towards a monitor, breathes, blinks and moves his head/tail. A volumetric brain builds inside the monitor cavity; its bounds are checked throughout the animation. Drag/keyboard/360° controls rotate the complete scene. This is an inferred and manually repaired reconstruction, **not a pixel-exact original authored 3D master**. The approved logo, copy and film are unchanged. No camera-dependent photo projection is used.

`workstation-scene.js`, `computer-workshop.js`, `capabilities.js` and `assets/boro-workstation-v7.glb` implement the current experience. The official Three.js r169 GLTF loader and geometry utility are vendored under `assets/three-addons/` with relative imports (no import-map dependency); their existing MIT notice is `assets/THREE-LICENSE.txt`.

The model loads near the section, with a bounded request, explicit failure/retry and a static alternative. Pausing freezes animation, while view rotation remains usable. Reduced motion starts paused; offscreen/background rendering stops. The character, monitor and brain are real geometry, but the animation illustrates capabilities: it does not access a microphone, PC agent, account or messaging API. Finger/jaw bones are prepared in the rig; this marketing scene does not implement independent finger gestures or audio-driven speech.

Validation: `node boroaios/tests/copy-qa.cjs`; set `BORO_NODE_MODULES` to a directory containing Playwright, then `node boroaios/tests/workstation-qa.cjs <baseURL> <absolute-report-directory>`. This suite checks native skins/joints, gross mesh deformation, anchored boots, all-angle snapshots, four widths, monitor containment, pause, rotation, reduced motion, offscreen suspension, model error/retry, missing/lost WebGL, video and contact preparation without sending. Historical `character-motion.test.mjs`/`browser-qa.cjs` below only validate V3, **not V6**. Physical Safari/iPhone and device FPS remain unverified.

Rollback: revert the scoped V7 commit on updated main and republish GitHub Pages to restore V6. Its model is retained unchanged. Legacy V3 modules/assets also remain available; never reset the repository or overwrite concurrent portfolio/Cora changes. No operational Jarvis/Boro runtime is changed by this marketing release.

## Previous V3 experience (retained for rollback)

Release `constructor3-20261011`: value comes before the feature catalogue. The hero explains Boro as a personal AI assistant for remembering, understanding, organising and doing, via voice or text; everyday life and entrepreneurship are both represented. The two approved brand headlines remain untouched. Four examples include everyday priorities alongside projects, campaigns and routines; configuration, permission and review limits remain explicit.

The arm reach is deliberately visible; a construction piece travels from the deformed palm into the brain. “Ver construir” explicitly restarts the current scene, even when paused; reduced motion still starts paused. CSS and both module entry points carry the same release query to avoid mixing old/new cached dependencies. “TALLER 3D · V3” identifies this release on desktop. A previously open tab still needs a normal navigation/reload; existing cached HTML cannot be replaced remotely.

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

Movement regressions: `node --test boroaios/tests/character-motion.test.mjs`; copy contract: `node boroaios/tests/copy-qa.cjs`. Browser suite: set `BORO_NODE_MODULES` to an installed directory containing `playwright` and `sharp`, then run `node boroaios/tests/browser-qa.cjs http://127.0.0.1:8771/boroaios/ <report-directory>`. Chrome must be installed. Reports/screenshots are generated outside the source tree. Tests never send WhatsApp messages or modify application runtimes. Check all six autonomous chapters, paused drag, reentry, context loss, accessible static controls and the mascot's full tail in both narrow and tablet layouts. V3 adds release/replay and minimum local arm-motion checks at each of four widths (32 browser checks total).

Current rollback: revert the builder-motion revision and republish Pages to restore `a92ca2f`. Copy now includes websites, applications and business/project tools, with agreed scope and human publication approval; it does not claim universal or already-validated application execution.

Revert the brain-workshop revision commit and republish Pages to restore `ac0840a`. All application runtimes, the film and other portfolio pages are out of scope and unchanged.
