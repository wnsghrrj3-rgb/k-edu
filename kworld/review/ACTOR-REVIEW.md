# K-HISTORY — human/deer graphics experiment

Status: **implementation draft; browser visual acceptance NOT completed**.

Base: `bc05798ccda0e74d85948248c6cf32c4de1b63f6` in `wnsghrrj3-rgb/k-edu`.
Branch: `graphics/paleo-human-deer`.

## Scope

The only existing production file edited is `kworld/core/game.js`: a six-line, paleo-only actor loader after the existing Player is constructed. The new module replaces the player body and the first existing deer target. Original `avatar.js` remains intact, including the guide. There is exactly one deer target in the current paleo GLB. Other eras, terrain, environment meshes, lights, camera, UI, inventory and mission definitions are unchanged.

The original models remain available if either asset fails to load. This branch has not been pushed or deployed.

## Assets and behavior

- `paleo-explorer.glb`: continuous face surface; separate sclera, irises, pupils, eyelids, brows, ear details and lips; tapered hair locks; continuous arm and leg surfaces, separately shaped fingers; layered hide shell with thickness, irregular hem, rawhide ties, seams and fur accents. Thirteen bones, eleven material batches.
- `red-deer.glb`: blended ribcage/neck, shaped muzzle, inset eyes, curved ears, articulated leg chains, separate hoof toes and dewclaws, short tail and swept antler beams with tines. Eighteen bones, five material batches.
- Original, deterministic procedural base-color, normal and roughness textures embedded in the GLBs. Texture sets reused across materials. No external model/texture downloads at runtime; no additional production dependencies.
- Player: blend into/out of walking, opposite arm swing, knee flexion, small hip/spine movement, idle breathing and head motion. Existing movement/camera remain the source of locomotion.
- Deer: distant browsing; alert within 7 m; watch within 3.8 m; brief retreat inside 1.55 m. Five-second retreat cooldown and 3 m home leash keep the original spear interaction reachable. Checks existing ground/water, bounds and obstacle logic. Retreat pauses while player input is disabled. Ear, head, tail and breathing movement remain small.
- The existing interactable record is retained. Bounds/center follow the animal. The existing hunting removal removes all deer geometry and stops its callback.

## Review log

These rounds are **offline OpenGL model inspections**, NOT the requested three browser/game-screen cycles.

1. `*-round01.jpg`: found bulbous cheeks/nose, uniform bowl fringe, skin intersecting tunic and lumpy deer neck/haunch transition.
2. `*-round02.jpg`: rebuilt face as a continuous shaped surface, reduced facial relief, asymmetric tapered locks, expanded hide shell, softened deer body transitions, and adjusted rear leg profile. Merged meshes by compatible material. Remaining issues: head proportion and exposed leg insertion edges.
3. `*-round03.jpg`: adjusted head proportions, leg widths, vertex-color range, bone names compatible with GLTFLoader, and skeleton/behavior checks. Remaining issues: elongated neck and overly raised grazing pose.
4. `*-round04.jpg`: shortened neck, buried leg insertion caps, corrected browsing rotation direction, deduplicated embedded textures. These geometry-only renders precede the final material adjustment.
5. `*-materials.jpg`: inspected actual embedded texture sets in an independent EGL renderer. Reduced oversized normal response, mottling and material brightness; adjusted wrist/upper-arm overlap and deer eyes. These are the **latest asset inspection images**, not screenshots of the live game.

The material inspection shader is an approximate standalone GGX lighting setup. It is not Three.js, has no game's environment lighting/post-processing/shadow pipeline and must not be used as proof of game appearance or performance.

## Validation performed

- `node kworld/tests/run.mjs`: passes. Includes the 32 paleo mission assertions, 50 original interaction targets retained, scenery/clearance checks, third-person reach, and tests for the other existing eras.
- `node --experimental-loader ./kworld/tests/three-loader.mjs kworld/tests/test_paleo_actors.mjs`: actual GLTFLoader parses both GLBs, validates finite positions, normalized weights and unchanged bind pose; tests idle blending, all distance states, bounded retreat, collision stop, updated interaction center and complete removal.
- In that headless test, texture decoding is deliberately replaced by placeholder textures. It tests geometry/skeleton/behavior, not browser JPEG uploads, GPU shader compilation or appearance. Embedded JPEG maps are decoded by the separate Python material inspection.

## Acceptance still outstanding

The supplied Cloud browser blocked localhost and shared-file URLs by security policy. No alternate browser or network bypass was attempted. Therefore:

- No actual player-camera screenshots of this branch.
- No desktop/mobile frame rate, draw-call timing, peak GPU memory or loading-time claim.
- No verified Three.js skin/material/shadow appearance.
- No game-screen walking/foot-slip, cloth clipping, grazing deformation or obstacle-edge acceptance.
- No three-cycle browser sign-off; no claim of AAA or commercial-ready quality.

Current geometry is approximately 325k triangles across the two actors and about 20 MB of GLBs. This is an intentionally unoptimized desktop graphics experiment. It needs actual device profiling before deployment. Hair remains sculpted locks rather than a production hair-card groom, clothing/fur need further art direction, and procedural gait lacks terrain foot IK and displacement-driven stride matching. The original locomotion speed is unchanged, so foot sliding is a known review risk.

## Reproduce

Serve the repository root and open `/kworld/?era=paleo`. Existing `V` switches views. The deer is the original hunting target near x=12,z=34. Preserve the existing mission route; no debug controls were added to the product.

Asset generation: `python kworld/tools/build_actors.py` (numpy, scipy, scikit-image, Pillow). Offline inspections additionally need ModernGL with EGL: `python kworld/tools/review_actors.py 05` and `python kworld/tools/review_pbr.py`. The `.npz` sidecars are generated temporary geometry for offline inspection and are not shipped or committed.

## Reference and provenance

Original geometry and procedural maps were authored for this experiment; no third-party game characters or commercial meshes were copied. Reference information informed proportions/material separation, not a literal archaeological reconstruction.

- [British Deer Society: red deer](https://bds.org.uk/information-advice/about-deer/deer-species/red-deer/) — species proportions, branched antlers and seasonal coat descriptions (search result; direct page fetch timed out).
- [NatureSpot: red deer](https://www.naturespot.org/species/red-deer) — photographic references for profile, muzzle, coat and grazing posture. Photos are not redistributed in the assets.
- [Smithsonian: bone and ivory needles](https://humanorigins.si.edu/evidence/behavior/making-clothing/bone-and-ivory-needles) — approximately 30,000–23,000-year-old needles from Xiaogushan support sewn fitted clothing in the Upper Paleolithic. This does not establish the exact outfit of Korean Paleolithic inhabitants.
- [Epic: Digital Humans](https://dev.epicgames.com/documentation/en-us/unreal-engine/digital-humans) — conceptual quality reference for separately treated skin, eyes and hair; no Epic assets used. This reference is not evidence the implementation reaches that quality.

The red-deer choice is a graphics/anatomy reference, not a verified identification of the particular animal species at the game's unspecified Korean Paleolithic site.
