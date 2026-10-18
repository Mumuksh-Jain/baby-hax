# Pip's First Night Shift — design system

Genre: playful storybook at midnight. Keep the official cream, berry, cocoa and gold palette and the existing Fraunces/Fredoka/Space Mono typography.

The gallery is a collection of illustrated invitations, with the passport above it. Each experience is a stage with a compact paper control desk. Stage art is decoration; controls, character states, routes, stamps, subtitles and audio remain live React elements.

Use the supplied theater plate, and non-destructive image-edited derivatives for the other environments. The railway derivative removes its painted searchlight; the Moonlight derivative removes both painted lamps and the ghost, reconstructing an empty table, bed and wall. The arched window, timber, shelves, lavender bedding and furniture remain illustrated scenery. Never display the original occupied room plate behind an additional lantern or ghost.

Named extensions live in /tokens.css and are imported by src/styles/production.css. Existing tokens remain in src/styles/tokens.css. Display headings stay roman. Buttons have visible focus, a minimum 44px touch target, and short action labels. Narrow layouts stack the scene and desk in one scrollable dialog.

Keep cinematic motion and its single audio owner. Reduced motion holds cinematic objects at settled positions while the narrative, audio and subtitles advance. Delivery still completes through its state machine, with camera motion suppressed. Native SVG wheels rotate around individual axles; a raster train cannot supply this motion.

The cloud decoration stays in the outer desktop gutters and never crosses the browser surface. Clickable chimes are in a separate layer.
