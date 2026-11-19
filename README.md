# bun-astro-template

A starter template for static websites built with [Astro](https://astro.build/),
run on [Node.js](https://nodejs.org/) with [pnpm](https://pnpm.io/), and deployed to
[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/)
as static assets. It started as a sibling of
[bun-lit-template](https://github.com/kamontat/bun-lit-template), with the same
tooling, CI and deploy setup, but runs on Node.js because Astro targets Node.js
first.

- [Stack](#stack)
- [Getting started](#getting-started)
- [Customize the template](#customize-the-template)
- [Project layout](#project-layout)
- [Scripts](#scripts)
- [Writing components](#writing-components)
- [Adding pages](#adding-pages)
- [Testing](#testing)
- [Deployment](#deployment)
- [Google Tag Manager](#google-tag-manager)
- [Agent skills](#agent-skills)

## Stack

| Concern       | Tool                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime       | [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (pinned via [mise](https://mise.jdx.dev/))                                                                           |
| Framework     | [Astro](https://astro.build/), static output                                                                                                                                     |
| CSS reset     | [`@kcstyles/reset.css`](https://www.npmjs.com/package/@kcstyles/reset.css)                                                                                                       |
| Lint / format | [Biome](https://biomejs.dev/) with `@kcconfigs/biome`                                                                                                                            |
| Type checking | `astro check` with `@kcconfigs/tsconfig` and Astro's `strictest` preset                                                                                                          |
| Tests         | [Vitest](https://vitest.dev/) with Astro's [Container API](https://docs.astro.build/en/reference/container-reference/) and [happy-dom](https://github.com/capricorn86/happy-dom) |
| Hosting       | Cloudflare Workers static assets via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)                                                                             |
| CI / CD       | GitHub Actions                                                                                                                                                                   |

`mise.toml` pins the Node.js and pnpm versions, `package.json` repeats the pnpm
version as `packageManager`, and CI installs both with
[`pnpm/setup`](https://github.com/pnpm/setup). `pnpm-workspace.yaml` saves exact
versions and lists the dependencies allowed to run build scripts (`esbuild`,
`workerd`).

## Getting started

> [!TIP]
> Prefer to let an AI agent do it? After step 1, open an agent in the
> repository and give it the prompt in [GET_START.md](GET_START.md). It
> customizes the project, sets up Cloudflare Workers and (optionally) Google
> Tag Manager, and deploys the hello-world page.

1. Create a new repository from this template (**Use this template** on GitHub),
   or clone it directly:

   ```bash
   git clone https://github.com/kamontat/bun-astro-template.git my-app
   cd my-app
   ```

2. Install the pinned toolchain (Node.js and pnpm) with mise, or install them
   yourself (see `mise.toml` for the expected versions):

   ```bash
   mise install
   ```

3. Replace the `name` placeholder in `package.json` (see
   [Customize the template](#customize-the-template)), then install
   dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server with hot reloading on
   <http://localhost:4321>:

   ```bash
   pnpm run dev
   ```

## Customize the template

After creating a project from this template, replace every `<TODO>`
placeholder (`grep -rn "<TODO>" --exclude-dir=node_modules .`):

| File                                      | Placeholder                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `package.json`                            | `name`, the package name                                                            |
| `wrangler.jsonc`                          | `name`, the Cloudflare Worker name                                                  |
| `src/pages/index.astro`                   | `<BaseLayout title="TODO">`, the page title (plain `TODO`, not matched by the grep) |
| `.github/workflows/deploy-preview.yml`    | `environment.url`, `https://pr-<number>-<TODO>.kcinth.workers.dev`                  |
| `.github/workflows/deploy-production.yml` | `environment.url`, `https://<TODO>.kc.in.th`                                        |

> [!IMPORTANT]
> `<TODO>` is not a valid Worker name, so `wrangler deploy` fails until it is
> replaced. Use the same value for the
> Worker name in `wrangler.jsonc` and in the preview URL.

The workflow URLs also contain the original author's domains. Replace
`kcinth.workers.dev` with your own `workers.dev` subdomain and `kc.in.th` with
your custom domain, or point the production URL at
`https://<worker-name>.<subdomain>.workers.dev` if you have no custom domain.

Then delete or replace the sample `HelloWorld` component and its test, and the
favicons in `public/`.

## Project layout

```text
.
├── src/                 # application code
│   ├── pages/           # routes, one file per page (index.astro is /)
│   ├── layouts/         # page shells             (import as #layouts/*), e.g. BaseLayout.astro
│   ├── components/      # Astro components        (import as #components/*), in atomic tiers:
│   │   ├── atoms/       #   smallest pieces, import no component (HelloWorld.astro)
│   │   ├── molecules/   #   groups of atoms
│   │   └── organisms/   #   page sections built from atoms, molecules and organisms
│   ├── lib/             # shared TypeScript       (import as #lib/*), e.g. gtm.ts
│   ├── styles/          # global CSS, imported by BaseLayout
│   └── env.d.ts         # types for import.meta.env (PUBLIC_GTM_ID)
├── public/              # static files copied to dist/ as-is (favicons, robots.txt)
├── tests/               # tests, mirroring src/ (src/lib/gtm.ts -> tests/lib/gtm.test.ts)
├── scripts/             # standalone programs run by package scripts (none yet)
├── .claude/skills/      # Claude Code skills for working in this repo
├── .github/workflows/   # CI, preview, and production deploy pipelines
├── .vscode/             # recommends the Astro extension, Biome fix on save
├── CHANGELOG.md         # what changed and why, newest first
├── GET_START.md         # setup prompt for an AI agent
├── astro.config.ts      # static output, file-format pages, no trailing slash
├── biome.json           # lint / format config
├── mise.toml            # pinned tool versions (Node.js, pnpm)
├── pnpm-workspace.yaml  # pnpm settings: exact versions, allowed build scripts
├── tsconfig.json        # TypeScript config (checks every .ts and .astro file)
├── vitest.config.ts     # Vitest through Astro's Vite config
└── wrangler.jsonc       # Cloudflare Workers config
```

### Import aliases

`package.json` defines [subpath imports](https://nodejs.org/api/packages.html#subpath-imports)
so you never need long relative paths:

```ts
import HelloWorld from "#components/atoms/HelloWorld.astro" // ./src/components/atoms/HelloWorld.astro
import BaseLayout from "#layouts/BaseLayout.astro" // ./src/layouts/BaseLayout.astro
import { loadGtm } from "#lib/gtm" // ./src/lib/gtm.ts
```

## Scripts

| Command                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `pnpm run dev`         | Start the dev server with hot reloading on port 4321          |
| `pnpm run build`       | Empty `dist/`, then build the static site into it             |
| `pnpm run preview`     | Serve the production build from `dist/` on port 4321          |
| `pnpm run test`        | Run tests with Vitest                                         |
| `pnpm run check`       | `check:type` then `check:biome`                               |
| `pnpm run check:type`  | Type check every `.astro` and `.ts` file with `astro check`   |
| `pnpm run check:biome` | Lint and format check with Biome, without changing files      |
| `pnpm run format`      | Apply Biome fixes and formatting (including unsafe ones)      |
| `pnpm run astro …`     | Any other Astro CLI command, e.g. `pnpm run astro add <name>` |

`dev` and `preview` accept `--port` / `--host`, for example
`pnpm run dev --port 3000`. See the
[Astro CLI docs](https://docs.astro.build/en/reference/cli-reference/) for all
options.

## Writing components

Components follow [Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/)
and live in `src/components/<tier>/` as `.astro` files:

| Tier      | Directory                   | Holds                                       | May import components from  |
| --------- | --------------------------- | ------------------------------------------- | --------------------------- |
| Atoms     | `src/components/atoms/`     | One element: heading, button, link, icon    | nothing                     |
| Molecules | `src/components/molecules/` | A few atoms working as a unit: search field | atoms                       |
| Organisms | `src/components/organisms/` | A page section: header, footer, card grid   | atoms, molecules, organisms |
| Templates | `src/layouts/`              | The page shell (`BaseLayout`)               | any tier                    |
| Pages     | `src/pages/`                | Routes filling a template with content      | any tier, layouts           |

`tests/components/atomic.test.ts` fails when a component sits outside a tier
or imports a tier it may not. Pick the lowest tier that fits; a component that
starts importing another of its own tier has grown into the next one.

The frontmatter runs at build time; the template below it becomes HTML, and `<style>` is scoped to the
component:

```astro
---
interface Props {
	name?: string;
}

const { name = "World" } = Astro.props;
---

<p>Hello, {name}!</p>

<style>
	p {
		font-weight: bold;
	}
</style>
```

Use it from a page or another component:

```astro
---
import Greeting from "#components/atoms/Greeting.astro";
---

<Greeting name="Astro" />
```

Client-side behaviour goes in a `<script>` tag inside the component; Astro
bundles it (TypeScript and `#lib/*` imports included) and ships it once per
page. To use a UI framework (React, Svelte, Lit, …) add its
[integration](https://docs.astro.build/en/guides/integrations-guide/) with
`pnpm run astro add <name>`.

> [!NOTE]
> Biome only reads an `.astro` file's frontmatter, so imports used only in the
> template look unused to it. `biome.json` turns those rules off for `.astro`
> files; without that, `pnpm run format` deletes component imports.

## Adding pages

Every `.astro` file under `src/pages/` becomes its own route, with no config
change needed:

```text
src/pages/index.astro        ->  /             (dist/index.html)
src/pages/about.astro        ->  /about        (dist/about.html)
src/pages/blog/post.astro    ->  /blog/post    (dist/blog/post.html)
```

Every page renders inside `BaseLayout`, which owns the `<html>` shell, the
global CSS and Google Tag Manager, either directly or through a layout that
wraps it (`tests/pages/pages.test.ts` fails otherwise):

```astro
---
import BaseLayout from "#layouts/BaseLayout.astro";
---

<BaseLayout title="About">
  <h1>About</h1>
</BaseLayout>
```

Link to routes without a trailing slash (`/about`): `trailingSlash: "never"`
makes `/about/` a 404, in `dev` as in production.

## Testing

Tests run with Vitest and live in `tests/`, mirroring
`src/`; `pnpm run check` typechecks them too. `vitest.config.ts` wraps Astro's
`getViteConfig`, so tests import `.astro` files directly and render them with
the Container API:

```ts
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { expect, test } from "vitest"
import HelloWorld from "#components/atoms/HelloWorld.astro"

test("renders custom name", async () => {
  const container = await AstroContainer.create()
  const html = await container.renderToString(HelloWorld, { props: { name: "Astro" } })
  expect(html).toMatch(/<h1[^>]*>Hello, Astro!<\/h1>/)
})
```

Browser code in `src/lib/` is tested against a DOM by starting the file with
`// @vitest-environment happy-dom` (see `tests/lib/gtm.test.ts`). happy-dom
reports external scripts as loaded instead of fetching them.

## Deployment

The site deploys to Cloudflare Workers as static assets. `wrangler.jsonc` runs
`pnpm run build` and uploads `dist/`.

### Manual deploy

A manual deploy builds without `PUBLIC_GTM_ID`, so it ships with Google Tag
Manager off unless you set the variable in your shell first.

```bash
pnpm exec wrangler login
pnpm exec wrangler deploy
```

### GitHub Actions

| Workflow                | Trigger        | Does                                                           |
| ----------------------- | -------------- | -------------------------------------------------------------- |
| `main.yml`              | every push     | `check`, `build`, `test`                                       |
| `deploy-preview.yml`    | pull requests  | uploads a preview version aliased `pr-<number>`                |
| `deploy-production.yml` | push to `main` | deploys to production, with `PUBLIC_GTM_ID` from `vars.GTM_ID` |

Both deploy jobs skip in a template repository
(`github.event.repository.is_template`), so this template never tries to deploy
itself while repositories created from it do.

Set these repository secrets for the deploy workflows:

| Secret                  | Value                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | your Cloudflare account ID                                                                                                          |
| `CLOUDFLARE_API_TOKEN`  | an **account** API token scoped to the Worker with **Editor**, plus **Workers Routes: Edit** on the zone if you use a custom domain |

A Worker-scoped token can deploy the Worker but not create it, so create the
Worker first with one local `pnpm exec wrangler deploy` after `pnpm exec wrangler login`
(`GET_START.md` does this for you).

And optionally this repository variable (see [Google Tag Manager](#google-tag-manager)):

| Variable | Value                                                                             |
| -------- | --------------------------------------------------------------------------------- |
| `GTM_ID` | your Google Tag Manager container ID (`GTM-XXXXXXX`); leave unset to keep GTM off |

Also create `preview` and `production` environments in the repository settings
(**Settings → Environments**). Each workflow's `environment.url` is only the
link GitHub shows on the deployment, so it must be updated by hand to match
your Worker (see [Customize the template](#customize-the-template)).

## Google Tag Manager

`src/layouts/BaseLayout.astro` loads a Google Tag Manager container on every
page through `loadGtm` in `src/lib/gtm.ts`. The container ID comes from
`PUBLIC_GTM_ID`, which `astro build` inlines at build time; `loadGtm` does
nothing when it is missing or not shaped like `GTM-XXXXXXX`. Without an ID the
bundler drops the GTM code entirely, so GTM is off in `pnpm run dev`, in tests
and in local builds.

Only `deploy-production.yml` passes the ID, from the `GTM_ID` repository
variable, so pull request previews never send data:

```bash
gh variable set GTM_ID --body "GTM-XXXXXXX"
```

Publish the container in Tag Manager at least once before deploying; an
unpublished container serves no `gtm.js`. To try it locally, build with the
variable and preview:

```bash
PUBLIC_GTM_ID=GTM-XXXXXXX pnpm run build && pnpm run preview
```

The script is a module script, so GTM starts after the HTML is parsed rather
than at the top of `<head>` as in Google's snippet, and there is no
`<noscript>` fallback.

## Agent skills

`.claude/skills/` holds [Claude Code skills](https://docs.claude.com/en/docs/claude-code/skills)
that teach an agent this repository's workflow and conventions:

| Skill                | Covers                                                                          |
| -------------------- | ------------------------------------------------------------------------------- |
| `project-shipping`   | every change in a worktree, test first, ending in a PR with a preview URL       |
| `project-landing`    | after approval: changelog entry, merge commit, worktree cleanup                 |
| `project-changelog`  | the `CHANGELOG.md` entry format and which section a change belongs in           |
| `project-pages`      | atomic pages: routes under `src/pages/`, page copy, links and trailing slashes  |
| `project-layouts`    | atomic templates: `BaseLayout`, layouts in `src/layouts/`, named slots          |
| `project-components` | atoms, molecules, organisms; scoped styles, client scripts, Container API tests |
| `project-deploy`     | the build, `astro.config.ts`, `wrangler.jsonc`, workflows, pinned action SHAs   |
| `project-scripts`    | package scripts, what `check` reads, TypeScript and Biome strictness            |

`project-shipping` and `project-landing` assume merge commits are allowed and
head branches are deleted after merge (`gh repo edit --enable-merge-commit
--delete-branch-on-merge`).
