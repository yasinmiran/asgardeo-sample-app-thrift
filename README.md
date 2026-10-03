# Thrift Sample App

A plain JavaScript single-page app that signs users in with WSO2 Identity Platform (formerly Asgardeo), built on [`@asgardeo/browser`](https://www.npmjs.com/package/@asgardeo/browser). It goes with the post [Asgardeo JIT user provisioning](https://yasint.dev/asgardeo-jit-user-provisioning/).

Version 1 used `@asgardeo/auth-spa` from a CDN. That SDK is [deprecated and no longer maintained](https://github.com/asgardeo/asgardeo-auth-spa-sdk), and its replacement ships as an npm module only, so the sample now runs on Vite. If you need the old one, it's tagged [`v1.0.0`](https://github.com/yasinmiran/asgardeo-sample-app-thrift/tree/v1.0.0).

## Register an application

In the console, create a single-page application and add `https://localhost:5173` both as an authorized redirect URL and as an allowed origin. Copy its client ID.

## Configure

```bash
cp .env.example .env
```

Then fill in `.env`:

```bash
VITE_ASGARDEO_CLIENT_ID=<your client ID>
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/<your org name>
```

## Run

```bash
npm install
npm run dev
```

The app opens at `https://localhost:5173`. The dev server uses a throwaway self-signed certificate, so the browser warns the first time; accept it and carry on. It's port 5173 rather than 5000 because macOS keeps 5000 for the AirPlay receiver.

`npm run build` writes a static build to `dist/` that any static host can serve. Register that host's URL in the console too.

## How the sign-in works

All of it lives in [`src/main.js`](src/main.js). The SDK is initialized with the client ID, base URL and the page's own origin as the redirect target. Clicking Login calls `signIn()`, which sends the browser to the authorize endpoint with PKCE. When it comes back with `?code=...` in the URL, `hasAuthParamsInUrl()` is true and a second `signIn()` call swaps the code for tokens; after that `isSignedIn()` decides which view to show. Logout is `signOut()`.

`@asgardeo/browser` is still pre-1.0, so the version is pinned exactly in `package.json`.
