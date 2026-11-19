import { readFile } from "node:fs/promises"
import { expect, test } from "vitest"

test("BaseLayout loads Google Tag Manager from PUBLIC_GTM_ID", async () => {
	const source = await readFile("src/layouts/BaseLayout.astro", "utf8")
	expect(source).toMatch(/import \{ loadGtm \} from "#lib\/gtm";?$/m)
	expect(source).toMatch(/loadGtm\(import\.meta\.env\.PUBLIC_GTM_ID, document\);?$/m)
})
