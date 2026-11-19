# Changelog

What changed in this project and why, newest first.

## 2026-11-20: Node.js and pnpm instead of Bun, and setup choices for rendering and UI framework

### BREAKING CHANGES

- Bun is gone: install Node.js and pnpm (or let mise read them from `package.json`) and run
  `pnpm install` and `pnpm run <script>` instead of `bun install` and `bun run <script>`.
  `bun.lock`, `bunfig.toml` and `@types/bun` are removed, so `Bun.*` APIs no longer type-check.
- `mise.toml` no longer pins tool versions; the Node.js and pnpm versions now live only in
  `package.json` `devEngines`.

### Features

- `GET_START.md` asks whether the site is `static` (default) or `server`. For `server` the
  agent adds the Cloudflare adapter so routes with `export const prerender = false` run in
  the Worker, wires `wrangler.jsonc` to the adapter's entry with an `ASSETS` binding, and
  proves it with a `/api/health` route, its test and a live check.
- `GET_START.md` asks for a UI framework (`none` by default, or `react`, `preact`, `svelte`,
  `vue`, `solid-js`). A chosen framework is added with `astro add`, re-pinned to exact
  versions, and proven by a `Counter` island tested through its container renderer.
- The README and the `project-components`, `project-pages` and `project-deploy` skills cover
  framework components and on-demand routes, including how to test each.

### Improvements

- The toolchain is pinned in one place, `package.json`: `devEngines.runtime` (Node.js
  24.22.3) and `devEngines.packageManager` (pnpm 12.22.0) with `onFail: "download"`, plus
  `volta.node` and an `engines.node` range. mise reads them through
  `idiomatic_version_file_enable_tools`, and CI's `pnpm/setup` step reads them too, with no
  version in any workflow.
- `pnpm-workspace.yaml` saves exact versions and allows only `esbuild` and `workerd` to run
  install scripts.
- `tests/config/toolchain.test.ts` fails when the pins drift between `devEngines`, `volta`,
  `engines`, `mise.toml` and the workflows, or when Bun files come back.
- `pnpm install` works before the `<TODO>` package name is replaced, so the setup prompt no
  longer warns about it.

### Decisions

- Node.js over Bun because Astro, Vitest and Wrangler target Node.js. Bun as runtime with
  pnpm as package manager was tried and reverted: with the Cloudflare adapter, `astro build`
  on Bun hung for over five minutes, where Node.js took about a second, and server code runs
  on Cloudflare's Workers runtime either way.
- Node.js 24 rather than 26, because `@kcconfigs/tsconfig` expects `@types/node` `^24`.
- Server rendering uses the Cloudflare adapter rather than a Bun or Node.js server, so the
  existing Workers deploy keeps working. The setup turns off sessions (`session: false`) and
  the Images binding (`imageService: "compile"`), because the Worker-scoped deploy token
  cannot provision the KV namespace and Images binding they need.
- Version pinning follows kc-workspace/kcws: `package.json` `devEngines` is the single
  source, rather than `mise.toml` plus a `packageManager` field and a workflow `runtime`
  input that had to be kept in sync.

## 2026-11-06: Dependency patch upgrades and Biome formatting for Astro files, and atomic design components with project skills

### BREAKING CHANGES

- `HelloWorld` moved to `src/components/atoms/`; import it as
  `#components/atoms/HelloWorld.astro`. A component left directly in `src/components/` now
  fails the tests.
- Every project skill is renamed with a `project-` prefix: `shipping-a-change` is
  `project-shipping`, `landing-a-change` is `project-landing`, `changelog` is
  `project-changelog`, `adding-a-page` is `project-pages`, `astro-components` is
  `project-components`, `build-and-deploy` is `project-deploy` and `repo-scripts` is
  `project-scripts`. Invoke them by the new names.

### Features

- Components follow Atomic Design in `src/components/atoms/`, `molecules/` and `organisms/`,
  with `src/layouts/` as templates and `src/pages/` as pages.
  `tests/components/atomic.test.ts` fails on a component outside a tier or an import its tier
  may not make: atoms import no component, molecules import atoms, organisms import atoms,
  molecules and organisms.
- A `project-layouts` skill covers `BaseLayout` and layouts that wrap it, split out of the
  components skill.
- `tests/skills.test.ts` requires every skill directory to start with `project-` and its
  `SKILL.md` `name` to match the directory.

### Improvements

- The `project-components`, `project-layouts` and `project-pages` skills each carry a worked
  example: a `Button` atom, a `SearchForm` molecule, a `SiteHeader` organism, an
  `ArticleLayout` template and a page that fills it.
- A page may render any layout that wraps `BaseLayout` instead of `BaseLayout` itself, and
  `tests/pages/pages.test.ts` now also fails on a layout that does not wrap `BaseLayout`.
- Astro is on 7.4.7, `@kcstyles/reset.css` on 2.1.1, `@kcconfigs/biome` on 4.2.1 and
  `@kcconfigs/tsconfig` on 2.1.4.
- `@kcconfigs/biome` 4.2.1 formats the frontmatter, scripts and styles of `.astro` files like
  the rest of the repo: no semicolons, and void tags such as `<meta>` without `/>`.
- The `BaseLayout` and page tests that read source text accept a line with or without a
  trailing semicolon, so they no longer break when the formatter changes.

### Bug fixes

- `<div row>` and `<div block>`, the `@kcstyles/reset.css` layout attributes, pass
  `astro check`: `src/env.d.ts` declares them on `astroHTML.JSX.HTMLAttributes`.

### Decisions

- The atomic templates and pages tiers reuse `src/layouts/` and `src/pages/` rather than
  adding `src/components/templates/`, so `BaseLayout` and the `#layouts/*` alias stay put.
- The skill examples live only in the skills, not in `src/`, so the template ships no
  components a new project has to delete. Each was type-checked and built before merging.

- TypeScript stays on 6.0.3 rather than 7.0.2, because `astro check` refuses to run on
  TypeScript 7. Astro points to the experimental `@astrojs/ts-content-mapper` for
  TypeScript 7.1+, which was not adopted here.

## 2026-11-05: Astro template on Bun, ported from bun-lit-template, and dependency upgrades with the Biome astro preset

### Features

- A static Astro 7 site with a `HelloWorld` component rendered inside `BaseLayout`, which
  owns the `<html>` shell, favicons, the `@kcstyles/reset.css` global stylesheet and Google
  Tag Manager. Every file under `src/pages/` is a route, built to `dist/<route>.html`.
- Every package script runs on the Bun runtime through `[run] bun = true` in `bunfig.toml`,
  as Bun's Astro guide recommends with `bunx --bun astro`.
- `bun run check` runs `astro check` (every `.astro` and `.ts` file, under the
  `@kcconfigs/tsconfig` `bun` preset plus Astro's `strictest`) and then Biome.
- Tests run with Vitest through Astro's Vite config: components render with the Container
  API, browser code runs under happy-dom, and `tests/pages/pages.test.ts` fails if a page
  stops using `BaseLayout`.
- Google Tag Manager loads from `PUBLIC_GTM_ID`, inlined at build time. `Deploy Production`
  passes it from the `GTM_ID` repository variable; without it the build has no GTM code.
- The CI and Cloudflare Workers deploy workflows, `GET_START.md` agent setup prompt and
  Claude Code skills from bun-lit-template, adapted to Astro; `ui-components` is replaced by
  `astro-components`.
- `.vscode/extensions.json` recommends the Astro extension, and `bun run astro …` runs any
  other Astro CLI command, such as `bun run astro add <integration>`.

### Improvements

- Every dependency is on its latest stable release, including Biome 2.6.5, Vitest 5.1.0,
  Astro 7.4.5, `@kcconfigs/biome` 4.2.0 and `@kcstyles/reset.css` 2.1.0.
- `biome.json` extends `@kcconfigs/biome/configs/astro`, which turns on Biome's full HTML
  support, so imports and variables used only in an `.astro` template are no longer flagged
  as unused. The local `.astro` rule overrides are gone, and
  `tests/config/biome.test.ts` checks this behaviour.
- The preset's base formatting now applies to the whole repo: no semicolons, 120-column
  lines, object bracket spacing, and Markdown formatted with space indents. Biome 2.5
  silently dropped the preset's nested `extends`, so this formatting was never applied before.

### Decisions

- Vitest replaces `bun test` because `.astro` files need Astro's Vite compiler, which
  `bun test` cannot load. It still runs on Bun, so no Node.js install is needed.
- `build.format: "file"` with `trailingSlash: "never"` keeps the bun-lit-template URL shape
  (`/about` served from `about.html`), and makes `dev` 404 the same paths production does.
- GTM stays a bundled module script calling `loadGtm`, not Google's inline snippet, so the
  id stays out of the repository and the call is dropped from builds without an id.
- TypeScript stays on 6.0.3 rather than 7: `@astrojs/check` accepts only `^5 || ^6` and
  `@kcconfigs/tsconfig` only `^6`.
