# Verified display derivatives

Original kit files in `backgrounds/`, `sprites/`, `official_pip/`, `previews/` and `references/` remain unmodified.

These two derivatives were made using the built-in ImageGen editor on 2026-10-18 and visually inspected before integration. They preserve the source composition but are regenerated illustrations, not pixel-identical restorations or editable layered source files.

## dream_express_world_no_beam.png

Source: `../backgrounds/dream_express_world.png`.

Prompt: Remove only the large painted triangular searchlight beam projecting leftwards from the lighthouse into the night sky. Fill that area with matching deep blue sky and tiny stars. Preserve the composition, buildings, railway, lighthouse, moon and clouds. Keep the lighthouse lantern glowing. No train, characters, UI or static light beam.

Acceptance: empty sky behind the separate rotating SVG searchlight; no new train or landmark duplicates.

## moonlight_room_empty.png

Source: `../backgrounds/moonlight_room.png`.

Prompt: Remove the white ghost from the bed and both lamps from the bedside table: the large dream lantern and the small red metal lantern. Reconstruct the empty blanket, pillows, tabletop and wall. Reduce the lamp's strong amber glow to neutral twilight. Preserve the arched window, moon, curtains, timber, shelves, plants, books, furniture, rug and room composition. No characters, lamps, lanterns, text or controls.

Acceptance: the bed and tabletop are empty. The app adds one masked official lantern, one state-driven SVG ghost, independent star projections and local lighting overlays. The original occupied room plate and its lighting references are never rendered behind these objects.

## Limits

The supplied plates are enlarged crops from a concept board. The supplied stars are small raster cutouts, with display contours used to exclude residual pale matte. Do not scale them indefinitely or describe them as rigged. Official PNGs have cream backgrounds; the app references those originals through SVG silhouette masks. The supplied locomotive bitmap has baked wheels and is retained as source art; the app instead uses its independent SVG locomotive and mailcar so wheel rotation remains real.
