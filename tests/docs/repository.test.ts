import { readFileSync } from "node:fs"
import { join } from "node:path"
import { expect, test } from "vitest"

const root = join(import.meta.dirname, "..", "..")
const read = (file: string) => readFileSync(join(root, file), "utf8")

// CHANGELOG.md keeps old names as history, so only the live docs are checked.
test.each(["README.md", "GET_START.md"])("%s names the repositories by their current names", (file) => {
	const source = read(file)
	expect(source).not.toMatch(/bun-astro-template|bun-lit-template|kamontat\/bun-/)
	expect(source).toContain("ktemplates/astro")
})
