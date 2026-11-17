# Nhi Yen portfolio

Faithful static copy of https://congchuanhihaha.framer.website/ including the original published Framer animation runtime, responsive layouts, 9 pages, fonts, images, and CMS data.

## Build and deploy

Run `npm run build`. Output: `dist/`. Vercel is configured in `vercel.json` and requires no dependencies.

The complete source is packaged in `source.tar.gz.part*` to support uploading through GitHub's browser interface. `source-manifest.json` records the parts and SHA-256 checksum. The build verifies and extracts the archive into `source/`, then copies `source/public/` to `dist/`. After building, the original HTML, JavaScript, CSS, assets, and refresh script are available under `source/`.

For local preview after build: `python3 -m http.server 4173 --directory dist`.

This is a copy of the published website build, not an editable Framer project or uncompiled React export. External Google Drive and social destinations remain external. The refresh script and archive report are included inside the source archive.
