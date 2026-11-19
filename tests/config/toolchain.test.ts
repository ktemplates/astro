import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(import.meta.dirname, "..", "..")
const read = (file: string) => readFileSync(join(root, file), "utf8")

describe("toolchain", () => {
	it("pins Node.js and pnpm with mise", () => {
		const mise = read("mise.toml")
		expect(mise).toMatch(/^node = "\d+\.\d+\.\d+"$/m)
		expect(mise).toMatch(/^pnpm = "\d+\.\d+\.\d+"$/m)
		expect(mise).not.toMatch(/^bun\b/m)
	})

	it("declares the same pnpm version as packageManager", () => {
		const pkg = JSON.parse(read("package.json"))
		const pnpm = read("mise.toml").match(/^pnpm = "(.+)"$/m)?.[1]
		expect(pkg.packageManager).toBe(`pnpm@${pnpm}`)
	})

	it.each(["main.yml", "deploy-preview.yml", "deploy-production.yml"])(
		"%s sets up the mise Node.js version with pnpm/setup",
		(workflow) => {
			const source = read(`.github/workflows/${workflow}`)
			const node = read("mise.toml").match(/^node = "(.+)"$/m)?.[1]
			expect(source).toMatch(/uses: pnpm\/setup@[0-9a-f]{40} # v\d+\.\d+\.\d+$/m)
			expect(source).toContain(`runtime: node@${node}`)
			expect(source).not.toMatch(/\bbunx?\b|mise-action/)
		},
	)

	it("has no Bun files, types or commands left", () => {
		for (const file of ["bun.lock", "bunfig.toml"]) expect(existsSync(join(root, file))).toBe(false)
		expect(existsSync(join(root, "pnpm-lock.yaml"))).toBe(true)
		const pkg = JSON.parse(read("package.json"))
		expect(pkg.devDependencies).not.toHaveProperty("@types/bun")
		expect(JSON.stringify(pkg.scripts)).not.toMatch(/\bbunx?\b/)
		expect(read("wrangler.jsonc")).toMatch(/"command": "pnpm run build"/)
	})
})
