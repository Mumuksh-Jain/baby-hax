# Production artwork redesign — 18 October 2026

## Checkpoint and scope

The starting checkout was clean at `29636aa`. The local checkpoint branch is `checkpoint/before-art-redesign-20261018`; work is on `codex/production-art-redesign`. No push was requested or performed.

`Pip_Production_Art_Kit_v1.zip` was extracted into `public/assets/production-art/`, preserving its folders. The manifest, README, environment preview and lighting reference images were inspected. Original kit assets remain unchanged. Two verified, non-destructive image edits live in `derived/`; their source mappings, prompts and limitations are recorded in [the derivative README](public/assets/production-art/derived/README.md).

## Changes

| Area | Result |
| --- | --- |
| Shared presentation | Cream paper controls, consistent typography, illustrated gallery invitations and responsive stage/desk layouts. The existing nursery, tabs, story, hidden postcard and ending remain available. Tokens and design direction are in `tokens.css`, `src/styles/production.css` and `design.md`. |
| Official artwork | `OfficialArt.jsx` displays the original official Pip and lantern through vector silhouette masks. The originals are not rewritten. |
| Star Orchestra | The supplied theater is the decorative set behind official Pip and three separate animated star buttons. The same sprite stars also fly through the existing film. Redundant oval portrait framing is removed. The original choreography, trails, thoughts, four story scenes, vocal owner, progress and completion remain. |
| Film fixes | Completion callbacks no longer restart the timeline when a parent renders. Shared entrance-star positioning no longer displaces film stars over Pip. Hover no longer teleports an animated star by replacing its path transform. Safe exit restores playable entrance stars. |
| Moonlight Lab | The edited room has an empty table and empty bed: both painted lamps and the painted ghost were removed and visually checked. Exactly one official lantern and one state-driven SVG ghost are composited above it. Local surface light, moonlight, lamp halo and star projections respond to the controls; no whole-app brightness filter is used. Eyes, mouth, shivering, sleep particles and feedback respond to the actual state. |
| Dream Express | The landscape and locomotive now share one SVG camera. Routes align with the illustrated stations. The independent SVG locomotive and mailcar are restored, with each wheel rotating about its own axle. Dispatch, three destinations, cargo, arrival reactions, receipts and stamps remain state-driven. The derivative removes the fixed painted beam so the separate live beacon is the only searchlight. |
| Living Dreamspace | Paper-cloud artwork is confined to the desktop outer gutters and cannot intercept pointers. Clickable constellation chimes have a separate target layer, including an accessible rail above the page on small screens. |
| Accessibility and motion | Experience dialogs contain keyboard focus, preserve Escape ownership for the nested film, lock background scrolling and restore focus on close. Reduced motion holds film stars in settled positions, removes decorative/wheel motion and suppresses camera movement while preserving story, audio and delivery completion. |

The supplied rubric was used as a quality reference. No unimplemented backend, WebGL scene, editable sprite rig or Lighthouse score is claimed.

## Verification

Build: `npm run build` passed. The complete interaction audit passed 169 assertions with zero console errors and produced 68 final captures. A follow-up capture audit verifies settled receipts, visible room states and separate header button targets after shortening the 320px workshop label.

With the built preview running on port 4173:

- `npm test` runs the assertion-based artwork/interaction audit. Its recorded result is [qa-results.json](screenshots/redesign/after/qa-results.json).
- `npm run test:regression` runs the existing final, artwork and vocal storybook regression scripts. The legacy final test now exits the visible film before testing the workshop button, and uses the current brightness slider selector. The legacy artwork capture now observes actual React delivery progress instead of assuming an incorrect trip duration.
- `node scripts/capture-room-states.js` records and checks that the actual room, rather than its scrolled control desk, is visible for every lighting capture. See [room-capture-results.json](screenshots/redesign/after/room-capture-results.json).

The audit covers widths 1440, 768, 414, 375 and 320: full gallery, interactive stage, warm/15% worried ghost, moon/90% squinting ghost, starlight/55% sleeping ghost, delivery at approximately 25/50/75% actual eased progress, two beacon angles, receipts and narrow controls. It checks overflow, equal star size, keyboard collection, focus wrapping, constellation hit targets, real wheel/beam movement and all three deliveries. Delivery screenshots use a 5 percentage-point capture tolerance.

The complete vocal sequence is tested through all four lyric scenes. Instrumentation observes one real decoded 20-second Web Audio source, natural completion, a fresh replay source and a stopped source after safe exit. Pip's listening reaction and reduced-motion behavior are also verified. The existing vocal regression separately checks scene props, glitter, finale, achievement and mobile layouts.

## Visual evidence

Before: [Orchestra](screenshots/redesign/before/orchestra.png), [Moonlight](screenshots/redesign/before/moonlight.png), [Express](screenshots/redesign/before/express.png).

After: [Orchestra](screenshots/redesign/after/1440-interactive-stage.png), [Moonlight](screenshots/redesign/after/1440-lantern-starlight-asleep.png), [Express](screenshots/redesign/after/1440-locomotive-50.png), [full gallery](screenshots/redesign/after/1440-full-gallery.png).

All width/state captures are in `screenshots/redesign/after/`. Review contact sheets are in `screenshots/redesign/review/`. Screenshots were opened and inspected for scene clipping, rectangular mattes, duplicated lamps/landmarks, control obstruction, train size and inconsistent stars. The simpler initial SVG room and the visible sky-paint experiment were rejected before final delivery.

## Honest artwork limits

- Original environment plates are enlarged concept-board crops. Their native detail is limited.
- The two empty-environment derivatives are image-edited illustrations, with small rendering differences from the source; they are not pixel-identical restorations or editable scene files.
- Star sprites are small raster cutouts. Display contours remove their pale rectangular surroundings; they remain unsuitable for unlimited enlargement or skeletal deformation.
- Official PNGs retain their cream backgrounds on disk. The app's display masks provide isolation at the tested sizes; no transparent source export is claimed.
- The supplied train PNG still has baked wheels and is retained as source art. Actual spinning wheels belong to the separate SVG train used by the app.
- Ghost emotions use separate SVG facial states, not a rig or morph of the supplied raster ghost poses.

No unresolved duplicate-object or blocked-control issue was accepted in the tested scenes. This audit does not certify audio licensing or a performance score.
