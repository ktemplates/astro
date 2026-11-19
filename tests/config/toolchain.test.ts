import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(import.meta.dirname, "..", "..")
const read = (file: string) => readFileSync(join(root, file), "utf8")
const pkg = JSON.parse(read("package.json"))
const pinned = (tool: string) => read("mise.toml").match(new RegExp(`^${tool} = "(.+)"$`, "m"))?.[1]

// Binaries that ship a `node` shebang and must be started with `bunx --bun`.
const nodeBinaries = ["astro", "vitest"]

describe("toolchain", () => {
	it("pins Bun and pnpm with mise, and no Node.js", () => {
		expect(pinned("bun")).toMatch(/^\d+\.\d+\.\d+$/)
		expect(pinned("pnpm")).toMatch(/^\d+\.\d+\.\d+$/)
		expect(pinned("node")).toBeUndefined()
	})

	it("uses pnpm as the package manager", () => {
		expect(pkg.packageManager).toBe(`pnpm@${pinned("pnpm")}`)
		expect(existsSync(join(root, "pnpm-lock.yaml"))).toBe(true)
		expect(existsSync(join(root, "bun.lock"))).toBe(false)
	})

	it("runs the tests on Bun", () => {
		expect(process.versions.bun).toBe(pinned("bun"))
	})

	it.each(Object.entries(pkg.scripts as Record<string, string>))(
		"script %s starts Node.js binaries on Bun",
		(_, command) => {
			for (const bin of nodeBinaries) {
				for (const [, prefix] of command.matchAll(new RegExp(`(\\S*\\s*\\S*\\s*)\\b${bin}\\b`, "g")))
					expect(prefix).toBe("bunx --bun ")
			}
		},
	)

	it("types Bun's runtime APIs", () => {
		expect(pkg.devDependencies).toHaveProperty("@types/bun", pinned("bun"))
		expect(pkg.devDependencies).not.toHaveProperty("@types/node")
		expect(JSON.parse(read("tsconfig.json")).extends).toContain("@kcconfigs/tsconfig/bun")
	})

	it.each(["main.yml", "deploy-preview.yml", "deploy-production.yml"])(
		"%s sets up the mise Bun version with pnpm/setup",
		(workflow) => {
			const source = read(`.github/workflows/${workflow}`)
			expect(source).toMatch(/uses: pnpm\/setup@[0-9a-f]{40} # v\d+\.\d+\.\d+$/m)
			expect(source).toContain(`runtime: bun@${pinned("bun")}`)
			expect(source).not.toMatch(/runtime: node|setup-bun|mise-action/)
		},
	)

	it("builds with pnpm in wrangler", () => {
		expect(read("wrangler.jsonc")).toMatch(/"command": "pnpm run build"/)
	})
})
