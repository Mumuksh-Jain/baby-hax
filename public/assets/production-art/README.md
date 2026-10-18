# Pip’s First Night Shift — Production Art Kit v1.0

This download contains usable cropped illustrated scene plates and isolated PNG sprites, extracted from newly generated artwork, plus the unmodified official Pip art from the supplied track pack. It is not an SVG source pack.

## Important distinction
The generated images initially arrived as a concept sheet, not separate scene files. Scene regions and objects have been physically extracted and saved as individual images. The scene plates were upscaled 3× from smaller artwork panels; upscaling makes their dimensions convenient for the website but does not create true native-detail resolution. Cutout sprite transparency is automated and needs visual QA on navy/cream.

### Backgrounds
- `star_theater.png` — Stage environment, *no Pip character*. Has some baked-in decorative stars and musical props. Overlay official Pip, interactive stars and animation separately.
- `moonlight_room.png` — Illustrative room, with a lantern and ghost **painted into the scene**. Treat as concept/visual reference until baked objects are removed cleanly. Three color-graded lighting reference variants are supplied. Do not overlay a second visible lantern blindly.
- `dream_express_world.png` — Railway environment with cottage, house and lighthouse, but **no locomotive**. It is suitable as a visual background for an independently moving locomotive; don't double-place optional landmark closeup sprites on top of the baked landmarks.

### Sprites
- `locomotive_mailcar.png` — train cutout, suitable for path travel, not an articulated mechanical SVG.
- `orchestra_star_1/2/3.png` — independent large star sprites.
- `cloud_cottage.png`, `sleepy_ghost_house.png`, `moonbeam_tower.png` — optional focus / event cutouts. The main environment already contains these.
- `moonlight_ghost_*` — alternate ghost expressions. Automatically extracted; inspect backgrounds and edge mattes.
- `dreamspace_paper_clouds.png` — decorative cloud/moon/stars cutout.

### Official Pip art
Use the official artwork as source of truth for Pip. PNG files are unmodified and have their original background; don't claim they are transparent. `pip_dream_lantern.png` and `pip_lullaby_box.png` are the official objects.

### Installation
Copy `backgrounds`, `sprites`, `official_pip` under `public/assets/production-art/` or adapt paths in your source. Do not copy `references/` as shipped production art. Use `manifest.json` for mappings and caveats.

### Credits / rights
Credit haX.baby for official supplied assets; credit generated art according to platform and event requirements. Confirm music recording redistributability separately. No audio files are included.

### Acceptance
Do not ship simply by showing these images. Verify each interactive object is actually separate, pointer-safe, focusable where appropriate, responsive, and visually integrated; preserve the existing orchestral film and sleep-lab controls. See `ANTIGRAVITY_INTEGRATION_PROMPT.md`.
