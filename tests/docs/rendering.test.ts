import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = join(import.meta.dirname, "..", "..")
const read = (file: string) => readFileSync(join(root, file), "utf8")

// Text of one "## Phase N" section of the GET_START.md prompt.
const phase = (n: number) =>
	read("GET_START.md")
		.split(/^## Phase /m)
		.find((s) => s.startsWith(`${n}:`)) ?? ""

describe("static or on-demand rendering choice", () => {
	it("GET_START.md asks for RENDERING with static as the default", () => {
		expect(phase(2)).toMatch(/RENDERING/)
		expect(phase(2)).toMatch(/Default: `static`/)
	})

	it("GET_START.md adds the Cloudflare adapter for server rendering without extra bindings", () => {
		const text = phase(4)
		expect(text).toContain("pnpm run astro add cloudflare --yes")
		expect(text).toContain('"main": "@astrojs/cloudflare/entrypoints/server"')
		expect(text).toContain('"binding": "ASSETS"')
		expect(text).toContain("session: false")
		expect(text).toContain('imageService: "compile"')
		expect(text).toContain("export const prerender = false")
	})

	it("GET_START.md verifies the API route on the live site", () => {
		expect(phase(7)).toContain("/api/health")
	})

	it("GET_START.md reports the rendering mode", () => {
		expect(phase(8)).toMatch(/Rendering/)
	})

	it("project-pages covers on-demand routes", () => {
		const skill = read(".claude/skills/project-pages/SKILL.md")
		expect(skill).toMatch(/^## On-demand routes and API endpoints$/m)
		expect(skill).toContain("export const prerender = false")
	})
})
