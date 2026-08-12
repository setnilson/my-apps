# Build, Upload, And Auth

This scaffold uses npm. Prefer the scripts in `package.json` over ad hoc commands.

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run build` runs a production build without enabling app asset upload by default.
- `npm run upload` sets `DD_APPS_UPLOAD_ASSETS=1` and builds/uploads the app.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run lint` and `npm run lint:fix` run ESLint.
- `npm run preview` serves the built output locally.

## Auth behavior

- OAuth is the default for local Datadog calls when API/app keys are absent.
- If both `DD_API_KEY` and `DD_APP_KEY` are present, the generated Vite config uses key-based auth.
- API/app keys are optional for local development, upload, build metrics, and Error Tracking source map upload depending on workflow.
- Do not ask users to paste keys, tokens, passwords, or secrets into an AI conversation.
- For non-US1 sites, update `auth.site` in `vite.config.ts`.

## Environment

- Check `package.json` `engines.node` for the supported Node.js versions.
- Prefer a current Node 22 release when debugging scaffolding or dependency install issues.
- OAuth token caching uses the optional `@napi-rs/keyring` dependency when available.

For detailed auth setup, `.env.local`, app key scopes, CI/CD, upload troubleshooting, or publishing behavior, use the Datadog Apps agent skill when it is available.
