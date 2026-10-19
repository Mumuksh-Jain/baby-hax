# Run Pip’s nursery

```sh
npm install
npm run build
npm start
```

Open `http://127.0.0.1:4173`. This serves the production website **and** the shared wish wall. `npm run preview` serves only static files; it does not provide the guestbook backend.

For development, keep `npm start` running for the API and run `npm run dev` in a second terminal. Vite forwards `/api` requests to port 4173.

## Persistent wishes

The backend saves wishes in `data/wishes.json`, excluded from Git. Set `PIP_DATA_DIR` to a persistent directory when hosting. `PORT` changes the server port; `HOST` changes the listening address (default `127.0.0.1`, use `0.0.0.0` on a host that requires it). `PIP_DEV_ORIGIN` permits one explicit development origin when posting directly across origins.

The guestbook has no seeded or invented visitor messages. It accepts short plain-text names and wishes, saves before acknowledging success, and broadcasts updates to connected visitors. Public deployment still needs an appropriate hosting/storage and moderation arrangement; this project has not been deployed or pushed.

## Artwork and voices

Original supplied art remains in `public/assets/production-art/`. `public/assets/optimized/` contains WebP delivery copies; regenerate them with `node scripts/optimize-art.js`. The source images remain unchanged.

The theater uses five locally rendered synthetic narration clips and the supplied vocal lullaby. `scripts/generate-narration.ps1` reproduces the narration on Windows with the installed Zira voice. The Three.js Pip sculpture is an independently modelled interpretation; the supplied illustrations are not a 3D rig.

See `RUBRIC_PROGRESS.md` for creation and validation status. Creation is followed by the full regression, visual and Lighthouse pass.
