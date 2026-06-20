# Fleetsurf Website

Static marketing site for [fleetsurf.ai](https://fleetsurf.ai).

## Structure

- `public/index.html` is the production page.
- `public/*.css` and `public/*.js` are the supporting design assets.
- `.github/workflows/deploy.yml` deploys `public/` to S3 and invalidates CloudFront on every push to `main`.

## Local Preview

```sh
python3 -m http.server 4173 --directory public
```

Then open `http://127.0.0.1:4173`.
