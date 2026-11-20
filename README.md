# Saipratap Dansana — 3D Digital Universe Portfolio

A responsive static portfolio built with HTML, CSS and vanilla JavaScript. No build step, package manager or backend is required.

## Features

- Cosmic starfield canvas and CSS 3D planet hero
- Responsive navigation and mobile menu
- Project cards with pointer-based 3D tilt and category filters
- Live public GitHub repository loader for `Saipratap-ux`
- Cinematic ambient sound generated with the Web Audio API (starts OFF; user opt-in)
- Contact links, scroll reveals, reduced-motion support
- PWA manifest and service worker for offline caching

## Run locally

The site can be opened directly using `index.html`. For best results (service workers require localhost or HTTPS), run a local static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Personalise before publishing

1. Open `index.html`.
2. Replace `saipratap@example.com` with your real contact email in the `mailto:` link and contact note.
3. Review the six featured projects and descriptions. Keep only projects that are public and accurately described.
4. Add a real profile photograph or CV if you want; the current profile mark uses initials to avoid inventing a portrait or qualifications.

## Deploy to GitHub Pages

### Recommended user-site URL

1. Sign in to GitHub as `Saipratap-ux`.
2. Create a **public** repository named exactly `Saipratap-ux.github.io`.
3. Upload the contents of this folder to the repository root. `index.html` must be at the root, not inside another nested folder.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/(root)`, then save.
7. Wait for the Pages deployment to finish. The expected address is:

   `https://saipratap-ux.github.io/`

If you use a different repository name, the URL will normally be `https://saipratap-ux.github.io/REPOSITORY-NAME/`. This project uses relative asset paths and supports a project subpath.

## Important notes

- GitHub Pages is static hosting. The GitHub API section reads public repositories in the visitor's browser; no private token is included.
- GitHub's unauthenticated API has rate limits. If the live repository list fails temporarily, the six curated project cards remain available.
- The sound is synthesized locally by the browser and is not a licensed commercial music track. It starts only after the visitor presses the sound control.
- The portfolio uses Google Fonts when online and falls back to system sans-serif fonts if unavailable.
- The service worker caches core files. After major updates, increment `CACHE_NAME` in `sw.js` to refresh clients.
