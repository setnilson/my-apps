# all-the-apps — Datadog Apps workspace

This is a Datadog Apps npm workspace. It can hold multiple apps, each independently developed, built, and uploaded.

## Layout

- `apps/<name>/` — each Datadog App lives in its own directory here.
- `packages/*` — optional shared libraries, depended on from apps via the `"*"` version range (npm workspaces links them locally). Create them with `npm init @datadog/apps --package <name>`.
- Shared config (root `package.json`, `tsconfig.base.json`) and `docs/agents/` live at the workspace root.

## Working with apps

- Run an app locally: `npm run dev -w apps/<name>` (from the workspace root), or `npm run dev` from inside the app directory.
- Build one app: `npm run build -w apps/<name>`.
- Upload one app: `npm run upload -w apps/<name>`.
- Build, typecheck, or lint the whole workspace from the root: `npm run build`, `npm run typecheck`, `npm run lint`.
- Each app owns its unique `apps.identifier` in `apps/<name>/vite.config.ts` — never share or copy it between apps.

## Adding another app

Run `npm init @datadog/apps` (or `npm init @datadog/apps --app <name>`) from inside this workspace. It auto-detects the workspace root, scaffolds `apps/<name>/`, and installs dependencies once at the root — no need to run `npm install` again per app.

After adding, removing, or renaming any app or package workspace, run `npm install` from the workspace root and commit the resulting root `package-lock.json`. Before finishing, run `npm ci --ignore-scripts` from the workspace root; a new workspace is not complete if this command reports that its package is missing from the lockfile. Confirm the lockfile contains both an `apps/<name>` or `packages/<name>` package entry and its corresponding `node_modules/<package-name>` workspace link.

### Required lockfile gate before opening or updating a PR

The root `package-lock.json` is generated output shared by every app and package. Never edit it by hand, splice JSON into it, or resolve a lockfile merge conflict line by line.

Bits Code must complete this procedure after making all workspace changes and before opening or updating a pull request:

1. Fetch and incorporate the latest `origin/master`. Do this before regenerating the lockfile so concurrent apps already merged into `master` remain represented.
2. If `package-lock.json` conflicts or cannot be parsed, restore its version from the latest `origin/master`; keep the app and package directories from both sides of the merge.
3. From the workspace root, regenerate the lockfile from the workspaces currently present:

   ```sh
   npm install --package-lock-only --ignore-scripts
   ```

4. Perform a clean installation from that generated lockfile:

   ```sh
   npm ci --ignore-scripts
   ```

5. Confirm the new workspace has both an `apps/<name>` or `packages/<name>` record and its `node_modules/<package-name>` workspace link in the root lockfile.
6. Commit the workspace files and root `package-lock.json` together. Do not open or update the pull request if lockfile generation or `npm ci` fails.

If `master` changes again before the pull request merges, repeat the entire procedure against the new `origin/master`. A previously successful check against an older base is not sufficient.

## Managing dependencies

Declare each dependency in the workspace that imports it, even when npm physically hoists it into the root `node_modules`:

- App runtime dependency: `npm install <dependency> -w apps/<name>`.
- Shared-package runtime dependency: `npm install <dependency> -w packages/<name>`.
- Root build tooling: run `npm install --save-dev <dependency>` from the workspace root without a workspace flag.
- Host-owned singletons such as React belong in a shared package's `peerDependencies`; apps that import React still declare it directly.

Run `npm install` and `npm ci` only from the workspace root. Every workspace or dependency change must update and commit the single root `package-lock.json`; do not create per-app lockfiles or maintain app-level `node_modules` directories. Never finish a workspace or dependency change without a successful root `npm ci --ignore-scripts`. npm's default hoisted strategy shares compatible versions at the root and may create nested copies only when versions conflict, so code must never rely on a dependency's physical install location.

## Sharing code between apps

Shared libraries live under `packages/<name>/` and are linked into apps through npm workspaces: depend on them with the `"*"` version range and npm resolves them from the local workspace, not the registry. (npm does not implement the `workspace:*` protocol that Yarn/pnpm use — use `"*"`.) Dev tooling (TypeScript, Vite, ESLint) is hoisted to the root, so a shared package needs no build step or toolchain of its own — Vite bundles its source directly.

Scaffold one with the CLI (recommended):

```sh
npm init @datadog/apps --package shared
```

This creates `packages/shared/` with a scoped `@all-the-apps/shared` package name, an `exports` map pointing at raw `src/index.ts` source, and a `tsconfig.json` that extends the root `tsconfig.base.json`. To wire it into an app:

1. Depend on it from the app (`apps/<name>/package.json`):

   ```json
   "dependencies": { "@all-the-apps/shared": "*" }
   ```

2. Run `npm install` once at the workspace root to link it.

3. Import it in the app like any other package:

   ```ts
   import { greet } from '@all-the-apps/shared';
   ```

If an app's `npm run typecheck` cannot resolve the shared package's types, add a `paths` entry to the app's `tsconfig.json` (or a TS project reference) pointing at the package source relative to the app directory (e.g. `../../packages/shared/src`). Runtime bundling via Vite works without this.

## Auth

Apps use OAuth by default for local development and uploads. Set `DD_API_KEY` and `DD_APP_KEY` in your environment to use API-key based auth instead.

Always resolve the Datadog site from `DD_SITE`, falling back to the workspace's `datadogApps.site` value when necessary. Set `DATADOG_SITE` from that resolved value for tools that use the legacy variable name. Never assume or hardcode `datadoghq.com`; this workspace may target staging (`datad0g.com`) or another Datadog site.

Each app's Vite configuration should follow this pattern:

```ts
import rootManifest from "../../package.json";

process.env.DD_SITE ||= rootManifest.datadogApps?.site;
process.env.DATADOG_SITE ||= process.env.DD_SITE;
```

## Publishing this workspace to a source code provider

When the user asks to "publish", "push up", or "create a repo" for this workspace:

1. Check whether an `origin` remote already exists.
2. If `origin` exists, show its URL and push the current branch. Never replace it without explicit approval.
3. If no remote exists and the user wants GitHub, confirm the target `OWNER/REPO`, then run `gh repo create OWNER/REPO --private --source=. --remote=origin --push` from this workspace root.
4. Use the workspace directory name as the repository name only when the user has not specified one. Default new repositories to private.
5. Confirm before creating any remote repository because it changes external state. Never force-push or change repository visibility unless explicitly requested.
6. If the provider CLI is missing or unauthenticated, preserve the local repository and give the user the manual command.
7. After publishing, remind the user to grant the Datadog GitHub or GitLab integration access before using the repository with Bits Code.

Bits Code supports both GitHub.com and GitLab.com. GitHub can be published with `gh` as described above. Do not assume the same command or authentication flow for GitLab; follow the configured GitLab source code integration and use its provider-specific tooling.

## Read relevant guides

- Embedded app context / routing / storage: `docs/agents/runtime-context.md`
- Backend functions (`*.backend.ts`): `docs/agents/backend-functions.md`
- Local dev / auth / build / upload: `docs/agents/build-upload-auth.md`
