# Get started with an AI agent

Use this after you have your own copy of the template:

1. Click **Use this template** on GitHub and clone the new repository, or
   clone `kamontat/bun-astro-template` directly.
2. Open an AI coding agent (Claude Code, Codex, Cursor, …) in that directory
   and paste the prompt below, or tell it to read `GET_START.md` and follow
   the prompt inside.

The agent customizes the project, deploys it to Cloudflare Workers, and
optionally wires up Google Tag Manager. It finishes with the hello-world page
live.

Before you start, have ready:

- A GitHub account, with the [GitHub CLI](https://cli.github.com/) installed
- A Cloudflare account (free plan is enough)
- A Google account, if you want Google Tag Manager
- [mise](https://mise.jdx.dev/), or [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/), installed
- Two decisions, which the agent asks about and explains if you are unsure:
  - a static site (every page built ahead of time, interactivity in the
    browser) or server rendering (API routes and per-request pages running
    in the Cloudflare Worker)
  - a UI framework (React, Svelte, Vue, …) or plain Astro components

The agent asks you for a few values and pauses for steps only you can do:
logging in to Cloudflare in the browser, typing the API token into a hidden
prompt, and creating the Google Tag Manager container. The token never passes
through the agent.

## Prompt

````markdown
You are setting up a web project in the current directory, which is a copy of
the template repository `kamontat/bun-astro-template` (Astro on Node.js with pnpm, deployed to
Cloudflare Workers static assets through GitHub Actions, with optional Google
Tag Manager). Work through the phases below in order. Stop and ask me whenever
a step needs my input or fails in a way you cannot fix. Do not skip
verification steps, and report real command output when something fails.

The template ships Claude Code skills in `.claude/skills/`. Two of them,
`project-shipping` and `project-landing`, require a worktree and pull request
for every change. They apply to changes made after this setup. This initial
setup commits directly to `main`, because there is no deployed site to preview
yet.

## Phase 0: Check prerequisites

Run and confirm each of these. If one is missing, tell me how to install it
and wait.

- `git rev-parse --show-toplevel` succeeds and `src/pages/index.astro`
  exists (we are inside the template copy). If not, stop and tell me to
  clone the repository first.
- `gh --version` and `gh auth status`: logged in with `repo` and `workflow`
  scopes. If not, ask me to run `gh auth login` or
  `gh auth refresh -s workflow`. If several accounts are listed, make sure
  the active one can write to my repository.
- `mise --version` (preferred), or `node --version` and `pnpm --version`.

## Phase 1: Find out which repository this is

Run `git remote get-url origin` and decide:

- **origin is my own repository** (created with **Use this template**): keep
  it. Read GITHUB_OWNER and REPO_NAME from
  `gh repo view --json owner,name --jq '.owner.login + "/" + .name'`.
- **origin is `kamontat/bun-astro-template`** (cloned directly): I need my own
  repository. Ask for GITHUB_OWNER (default `gh api user --jq .login`),
  REPO_NAME (default: the directory name) and visibility (default
  `private`) in Phase 2, then in Phase 3 step 1 create it.
- **No origin, or something else**: show me what you found and ask.

## Phase 2: Gather inputs

Ask me for these values in one message, and suggest defaults:

1. PROJECT_NAME: lowercase letters, digits, and dashes. Used as the package
   name and the Cloudflare Worker name. Default: REPO_NAME, lowercased.
2. PAGE_TITLE: the HTML `<title>`. Default: PROJECT_NAME.
3. CUSTOM_DOMAIN: optional hostname such as `app.example.com`. Only valid if
   its zone is already on my Cloudflare account. Leave empty to use the free
   `workers.dev` URL.
4. GTM: yes or no, do I want Google Tag Manager? Default: yes. I will create
   the container in Phase 6, so you do not need the ID yet.
5. UI_FRAMEWORK: which UI framework, if any, interactive components are
   written in. Default: `none`. Offer these, with one line each so I can
   choose:
   - `none`: plain `.astro` components, with a `<script>` tag for
     interactivity. Ships the least JavaScript and needs nothing extra; best
     for content sites and small widgets. A framework can still be added
     later with the same steps.
   - `react`, `preact`, `svelte`, `vue`, `solid-js`: official Astro
     integrations. Pick one when the site needs stateful interactive islands
     (forms, dashboards, client-side state) or when I want to reuse
     components or libraries written for that framework. `preact` is the
     small React-compatible option.
   - Any other Astro integration name, if I ask for one.

   Recommend one framework at most. React, Preact and Solid all use JSX, and
   mixing two of them needs per-folder `include` settings in
   `astro.config.ts`.
6. RENDERING: `static` or `server`. Default: `static`. Explain the
   difference so I can choose:
   - `static`: every page is built to HTML at build time and served as
     static assets, with client-side JavaScript (and UI_FRAMEWORK islands)
     for interactivity. No server code runs, so there is nothing to scale
     or secure at runtime. Right for content sites, docs, landing pages and
     apps that call someone else's API from the browser.
   - `server`: adds the Cloudflare adapter so chosen routes render on each
     request inside the Worker, for API endpoints, form handling, auth,
     per-user pages, or reading secrets and Cloudflare bindings (KV, D1,
     R2). Pages not opted in stay static. The server code runs on
     Cloudflare's Workers runtime, not Node.js, so Node-only packages may
     not work there.
7. Only for a direct clone: GITHUB_OWNER, REPO_NAME and visibility (see
   Phase 1).

## Phase 3: Prepare the repository

1. Only for a direct clone, create my repository and start a fresh history
   (my project should not carry the template's commits). Tell me before you
   run this:

   ```bash
   git remote rename origin template
   git checkout --orphan fresh-main
   git add -A
   git commit -m "chore: initialize project from bun-astro-template"
   git branch -D main
   git branch -m main
   gh repo create GITHUB_OWNER/REPO_NAME --VISIBILITY --source . --remote origin
   git remote remove template
   ```

   This commit is replaced by the real setup commit in Phase 7, so do not
   push yet.
2. Install the toolchain pinned in `package.json` `devEngines` with
   `mise install` (skip without mise: pnpm downloads the pinned pnpm and
   Node.js itself). Dependencies are installed in Phase 4.
3. Delete `GET_START.md`; it only applies to the template.

## Phase 4: Replace template placeholders

List every placeholder with:

```bash
grep -rn "<TODO>" --exclude-dir=node_modules .
```

Replace them as follows:

| File                                      | Change                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `package.json`                            | `"name": "<TODO>"` to `"name": "PROJECT_NAME"`                                                                      |
| `wrangler.jsonc`                          | `"name": "<TODO>"` to `"name": "PROJECT_NAME"`                                                                      |
| `src/pages/index.astro`                   | `<BaseLayout title="TODO">` to `<BaseLayout title="PAGE_TITLE">` (plain `TODO`, so the grep above does not list it) |
| `.github/workflows/deploy-preview.yml`    | `environment.url`: fix in Phase 5 once the workers.dev subdomain is known                                           |
| `.github/workflows/deploy-production.yml` | `environment.url`: fix in Phase 5                                                                                   |

The workflow URLs also contain the template author's domains
(`kcinth.workers.dev` and `kc.in.th`). Both must be replaced; never leave
them in my repository.

If CUSTOM_DOMAIN is set, add this top-level key to `wrangler.jsonc` so
Wrangler attaches the domain on deploy:

```jsonc
"routes": [{ "pattern": "CUSTOM_DOMAIN", "custom_domain": true }]
```

Keep the sample `HelloWorld` component and its test; it is the page we are
deploying. Keep `src/lib/gtm.ts` and the `<script>` in
`src/layouts/BaseLayout.astro` even if GTM is "no": without a container ID the
build contains no GTM code at all.

Install dependencies with `pnpm install`.

If UI_FRAMEWORK is not `none`, add it now:

1. Run `pnpm run astro add UI_FRAMEWORK --yes`. It installs the integration
   and the framework, registers it in `astro.config.ts`, and, for JSX
   frameworks, sets `jsx` and `jsxImportSource` in `tsconfig.json`. It may
   also create a framework config file such as `svelte.config.js`; keep it.
2. The project pins exact versions (`saveExact` in `pnpm-workspace.yaml`),
   but `astro add` writes `^` ranges. Remove every `^` it added in
   `package.json`, move any `@types/*` packages it put in `dependencies` to
   `devDependencies`, then run `pnpm install` again. If it fails with
   `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds <package>` for the
   packages listed and install again.
3. Run `pnpm run format`; `astro add` rewrites config files with spaces.
4. Prove the renderer works with one small interactive island: a
   `Counter` component in `src/components/atoms/` written in UI_FRAMEWORK
   (a button showing `Count: {count}` that increments on click, with a
   `start` prop), rendered from `src/pages/index.astro` below `HelloWorld` as
   `<Counter start={0} client:visible />`. Test it in
   `tests/pages/index.test.ts`: the Container API only renders `.astro`
   files, so render the page, and load the framework's renderer from its
   container entry point:

   ```ts
   import { loadRenderers } from "astro:container"
   import { getContainerRenderer } from "@astrojs/UI_FRAMEWORK/container-renderer"
   import { experimental_AstroContainer as AstroContainer } from "astro/container"
   import { expect, test } from "vitest"

   import Index from "../../src/pages/index.astro"

   test("index renders the Counter island", async () => {
   	const renderers = await loadRenderers([getContainerRenderer()])
   	const container = await AstroContainer.create({ renderers })
   	const html = await container.renderToString(Index)
   	expect(html).toMatch(/<astro-island[^>]*>.*Count: (<!-- -->)?0/s)
   })
   ```

   (`solid-js` uses `@astrojs/solid-js/container-renderer`.) Import
   `getContainerRenderer` from `/container-renderer`, not the package root,
   where it is deprecated.
5. `astro check` typechecks `.astro`, `.ts` and `.tsx` files, but not the
   `<script>` block of `.svelte` or `.vue` files. For those, tell me that
   `svelte-check` or `vue-tsc` would be needed for full type checking, and
   leave adding it to me.

If RENDERING is `server`, add on-demand rendering:

1. Run `pnpm run astro add cloudflare --yes`. It installs
   `@astrojs/cloudflare`, sets `adapter` in `astro.config.ts`, adds a
   `generate-types` script (`wrangler types`) and includes
   `worker-configuration.d.ts` in `tsconfig.json`. Keep all of that, and
   pin the new dependency exactly and run `pnpm run format` as for
   UI_FRAMEWORK above.
2. In `astro.config.ts`, keep `output: "static"` (pages stay prerendered
   unless a route opts out), pass `imageService: "compile"` to the adapter,
   and add `session: false`:

   ```ts
   adapter: cloudflare({ imageService: "compile" }),
   session: false,
   ```

   Without these the Worker also needs a KV namespace (`SESSION`) and an
   Images binding, which Wrangler provisions on deploy and the Worker-scoped
   API token from Phase 5 cannot create. Turn them on later, with the
   matching token permissions, when a route needs `Astro.session` or
   on-request image resizing.
3. Point `wrangler.jsonc` at the adapter's Worker entry and bind the static
   assets to it:

   ```jsonc
   "main": "@astrojs/cloudflare/entrypoints/server",
   "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
   "assets": { "binding": "ASSETS", "directory": "dist" },
   ```

   The build now writes `dist/client/` (static files) and `dist/server/`
   (the Worker, with a generated `wrangler.json` that `wrangler deploy`
   picks up automatically).
4. Prove it with one API route, `src/pages/api/health.ts`:

   ```ts
   import type { APIRoute } from "astro"

   // Rendered on request by the Worker, not at build time.
   export const prerender = false

   export const GET: APIRoute = () => Response.json({ status: "ok" })
   ```

   and `tests/pages/api/health.test.ts`, which calls the handler directly
   (the Container API's types only accept `.astro` components):

   ```ts
   import type { APIContext } from "astro"
   import { expect, test } from "vitest"

   import { GET, prerender } from "../../../src/pages/api/health"

   test("/api/health renders on request", () => {
   	expect(prerender).toBe(false)
   })

   test("GET /api/health responds ok", async () => {
   	const response = await GET({} as APIContext)
   	expect(response.status).toBe(200)
   	expect(await response.json()).toEqual({ status: "ok" })
   })
   ```

Then verify locally. All three must pass before going further:

```bash
pnpm run check
pnpm run test
pnpm run build
```

Confirm the grep prints nothing except the two workflow URLs still pending
Phase 5.

## Phase 5: Set up Cloudflare

1. Log in to Wrangler. This opens a browser, so ask me to run it myself:

   ```
   ! pnpm exec wrangler login
   ```

   Then run `pnpm exec wrangler whoami` and read the account ID from the output.
   If I have several accounts, ask which one to use. Call it ACCOUNT_ID.
2. Create the Worker with a first deploy from this machine. The API token in
   the next step is scoped to this one Worker, and a Worker-scoped token can
   deploy a Worker but not create it, so the Worker must exist first:

   ```bash
   CLOUDFLARE_ACCOUNT_ID=ACCOUNT_ID pnpm exec wrangler deploy
   ```

   This runs `pnpm run build` and uploads `dist/` using my `wrangler login`
   session. It also attaches CUSTOM_DOMAIN when one is set. The site is live
   from here, with Google Tag Manager off; the CI deploy in Phase 7 replaces it.
   Read the `workers.dev` URL from the output,
   `https://PROJECT_NAME.SUBDOMAIN.workers.dev`, and call the part before
   `.workers.dev` SUBDOMAIN. If the output says the account has no
   `workers.dev` subdomain, ask me to open **Workers & Pages** in the
   Cloudflare dashboard once to register one, then deploy again.
3. Ask me to create an **account** API token, which Cloudflare recommends for
   CI over a user token, because Wrangler cannot create one:
   - Open <https://dash.cloudflare.com/?to=/:account/api-tokens> (**Manage
     Account** → **Account API Tokens**) in the ACCOUNT_ID account
   - **Create Token**, start from the **Edit Cloudflare Workers** template
   - Scope Workers access to the PROJECT_NAME Worker only, with **Editor**
     permission
   - If CUSTOM_DOMAIN is set, add **Workers Routes: Edit** for its zone; every
     deploy re-applies the custom domain and fails without it
   - Create it and keep the page open for the next step
4. Store both secrets in the GitHub repository. Set the account ID yourself:

   ```bash
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo GITHUB_OWNER/REPO_NAME --body "ACCOUNT_ID"
   ```

   For the token, ask me to run this so it is typed into a hidden prompt and
   never appears in your context or logs:

   ```
   ! gh secret set CLOUDFLARE_API_TOKEN --repo GITHUB_OWNER/REPO_NAME
   ```

   Never ask me to paste the token into the chat, and never write it to a
   file. Confirm both secrets exist with
   `gh secret list --repo GITHUB_OWNER/REPO_NAME`.
5. Fix the workflow URLs, using SUBDOMAIN from step 2:
   - `deploy-preview.yml`:
     `url: https://pr-${{ github.event.number }}-PROJECT_NAME.SUBDOMAIN.workers.dev`
   - `deploy-production.yml`: `url: https://CUSTOM_DOMAIN` if set, otherwise
     `url: https://PROJECT_NAME.SUBDOMAIN.workers.dev`

   Call the production URL PRODUCTION_URL. Confirm
   `grep -rn "<TODO>\|kcinth\|kc\.in\.th" --exclude-dir=node_modules .`
   prints nothing.
6. Create the GitHub environments the deploy workflows reference:

   ```bash
   gh api -X PUT repos/GITHUB_OWNER/REPO_NAME/environments/preview
   gh api -X PUT repos/GITHUB_OWNER/REPO_NAME/environments/production
   ```
7. Match the repository settings the bundled skills expect (merge commits
   allowed, head branches deleted after merge):

   ```bash
   gh repo edit GITHUB_OWNER/REPO_NAME --enable-merge-commit --delete-branch-on-merge
   ```

## Phase 6: Set up Google Tag Manager

Skip this phase if I answered "no" to GTM. GTM can be turned on later by
doing this phase and redeploying.

The template loads GTM from `src/layouts/BaseLayout.astro` through
`src/lib/gtm.ts`, reading the container ID from `PUBLIC_GTM_ID` at build time. Only `deploy-production.yml` passes
it, from the `GTM_ID` repository variable, so local dev and pull request
previews never send data.

1. Ask me to create the container, since it needs my Google account:
   - Open <https://tagmanager.google.com/> and create an account (or pick an
     existing one)
   - Add a container named after PROJECT_NAME, target platform **Web**
   - Close the install-snippet dialog (the template already does that part)
     and copy the container ID, which looks like `GTM-XXXXXXX`
   - Click **Submit** and **Publish** once, even with no tags yet. An
     unpublished container serves no `gtm.js`, so the page would request
     it and get a 404
2. Check the ID matches `^GTM-[A-Z0-9]+$`; `src/lib/gtm.ts` silently ignores
   anything else. Then confirm the container is published:

   ```bash
   curl -fsS -o /dev/null -w "%{http_code}\n" "https://www.googletagmanager.com/gtm.js?id=GTM_ID"
   ```

   Expect `200`. A `404` means it is not published yet.
3. Store it as a repository variable (not a secret: it ends up in public page
   source anyway):

   ```bash
   gh variable set GTM_ID --repo GITHUB_OWNER/REPO_NAME --body "GTM_ID"
   ```

## Phase 7: Commit, push, and deploy

1. Commit on `main` and push. For a direct clone, amend the Phase 3 commit so
   the history stays a single initial commit:

   ```bash
   git add -A
   git commit -m "chore: initialize project from bun-astro-template"   # or: git commit --amend --no-edit
   git push -u origin main
   ```

   The push triggers two workflows: `Main` (check, build, test) and
   `Deploy Production`, which redeploys the Worker created in Phase 5 with the
   API token, this time with Google Tag Manager if `GTM_ID` is set. For a
   repository made with **Use this template**,
   GitHub already ran both on the template's copied commit, before the
   placeholders were replaced; that failed run is expected, ignore it.
2. Watch the runs until they finish:

   ```bash
   gh run list --repo GITHUB_OWNER/REPO_NAME --limit 5
   gh run watch <run-id> --repo GITHUB_OWNER/REPO_NAME --exit-status
   ```

   If `Deploy Production` fails, read the log with
   `gh run view <run-id> --log-failed`, fix the cause, push again, and
   re-watch. Do not retry blindly. Usual suspects: wrong ACCOUNT_ID; the token
   scoped to a different Worker than the `name` in `wrangler.jsonc`; the token
   missing **Workers Routes: Edit** for the CUSTOM_DOMAIN zone; or the token
   created as a user token in another account.
3. Verify the live site. The page is rendered at build time, so the greeting
   is in the HTML:

   ```bash
   curl -fsS https://PRODUCTION_URL | grep -o "Hello, World!"
   ```

   A new Worker or custom domain can take a minute to resolve; retry a few
   times before treating it as a failure. If UI_FRAMEWORK is not `none`, also
   confirm the Counter island shipped:

   ```bash
   curl -fsS https://PRODUCTION_URL | grep -o "<astro-island" | head -1
   ```

   If RENDERING is `server`, confirm the Worker answers on request:

   ```bash
   curl -fsS https://PRODUCTION_URL/api/health
   ```

   Expect `{"status":"ok"}`.
4. If GTM was set up, verify the container ID was built in. Astro inlines
   the small GTM script into the page, so it is in the HTML:

   ```bash
   curl -fsS https://PRODUCTION_URL | grep -o "GTM_ID"
   ```

   It must print the ID. If it does not, the `GTM_ID` variable was not
   set when `Deploy Production` ran: set it and re-run the workflow with
   `gh run rerun <run-id>`. Then ask me to open the site with GTM's
   **Preview** mode (Tag Assistant) to confirm the container connects.

## Phase 8: Report

Finish with a short summary:

- Repository URL
- Production URL (and the preview URL pattern for pull requests)
- Google Tag Manager: container ID, or "off" with how to turn it on later
- Rendering: `static`, or `server` with the `/api/health` URL and a note
  that sessions and the Images binding are off
- UI framework: the integration added, or "none" with how to add one later
  (`pnpm run astro add <name>`, then the Phase 4 steps)
- What I still need to do by hand, if anything (for example, a custom domain
  waiting on DNS, or adding tags in GTM)
- Next steps: open a pull request to see a preview deploy, then replace the
  `HelloWorld` component (and the `Counter` island, if any) with real content
  (see the README)
````
