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

describe("UI framework choice", () => {
	it("GET_START.md asks for UI_FRAMEWORK with no framework as the default", () => {
		expect(phase(2)).toMatch(/UI_FRAMEWORK/)
		expect(phase(2)).toMatch(/Default: `none`/)
	})

	it("GET_START.md adds the chosen framework, pins it exactly and tests it with its container renderer", () => {
		const text = phase(4)
		expect(text).toContain("pnpm run astro add UI_FRAMEWORK --yes")
		expect(text).toMatch(/exact versions/)
		expect(text).toContain("/container-renderer")
	})

	it("GET_START.md reports the framework at the end", () => {
		expect(phase(8)).toMatch(/UI framework/)
	})

	it("project-components covers framework components", () => {
		const skill = read(".claude/skills/project-components/SKILL.md")
		expect(skill).toMatch(/^## UI framework components$/m)
		expect(skill).toContain("/container-renderer")
	})
})
