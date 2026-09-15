# KWorld

Static Three.js history exploration game. Serve the repository root and open `/kworld/`.

## Landscape update

`eras/paleo/landscape.js` creates the rock shelter, hide shelters, forest, meadow and river details after the original GLB loads. The GLB and height map remain the sources of mission targets and walking height. `core/engine.js` excludes the old cave, hills, trees, grass and hut poles when the era's `world.json` names a `landscape` module (`engine.skipDecor`); it retains terrain, paths and all `ix_*` interaction objects. Replacement trees avoid mission objects. Static props are batched by material; foliage and grass use instanced geometry and GPU wind.

- `core/visuals.js`: procedural sky dome (sun, haze, drifting clouds), sunlit dust motes, water ripple, colour-grade pass. `?fx=0` disables; post-processing (bloom · grade · SMAA) is on by default for high-tier devices, `?post=0` off, `?ao=1` adds GTAO. `world.json` may set `skyLook: {zenith, horizon, haze, cloud}`.
- Surface textures: `tools/gen_textures.py` writes tiling PBR sets to `tex/` (rock, dirt, grass, bark). `world.json` `surfaces` maps GLB material names to a set; `applySurfaces` box-projects world-space UVs so procedural GLBs need none. Paleo is the first era wired.
- `core/avatar.js`: articulated student and guide; procedural walking animation.
- `core/player.js`: first/third-person switch (`V`), following-camera obstacle checks and input reset on blur.
- `core/fire.js`: flame planes and rising sparks, visible only after the existing fire mission succeeds.
- `core/minimap.js`: landmarks and player heading, drawn at a throttled rate.

Paleo starts in third person. Interaction distance is measured from the player in both views. The original mission progression is unchanged.

## Story layer

`core/story.js` + `core/props.js`: when `world.json` names a `scene` file, GLB interactables are removed/added by json coordinates (procedural props, recoloured avatars, `showIf` flag conditions), with prologue, journal, choices, flee and pick-recipes. First use: `eras/story-p1/` (`?era=story-p1`), ACT 1–4 of `docs/kedu-world/KEDU_HISTORY_STORY_MASTER_v1.md` on the paleo terrain.

## Verification

Run `node kworld/tests/run.mjs`. No npm installation is needed: the resolver uses vendored Three.js. Tests cover the existing 32 mission assertions, retention of 50 interaction targets, finite scenery geometry, batching, clear spawn and adjacent target approach points, and third-person interaction reach. Approach checks are local clearance checks, not a complete pathfinding proof.

The available remote browser returned `Error creating WebGL context` even on the previous live version. Geometry was inspected using a separate CPU projection, which does not validate browser lighting, shaders, shadows or frame rate. Desktop/mobile WebGL visual and performance checks remain necessary.
