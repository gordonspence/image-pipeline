# Local Next.js example

From the repository root:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. The upload route uses the avatar preset and local filesystem storage. Saved outputs appear in `public/uploads`; that directory is ignored by Git. The source upload is not retained.

The server is bound to loopback. Uploads require a matching browser Origin and are refused in production. This is a runnable integration reference; it is not a hosted service or a deployment template with authentication included.

To adapt it, replace the local upload gate with real authentication and target-resource authorization, choose a server preset, configure durable storage, and save the returned metadata using your own database. Keep request limits and origin/CSRF protection. See the root integration and security documents.

`npm run build:example` from the root checks the production build. A production server can render the page, but its demonstration upload route intentionally returns 403.
