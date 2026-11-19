import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { expect, test } from "vitest"

import HelloWorld from "#components/atoms/HelloWorld.astro"

test("renders default greeting", async () => {
	const container = await AstroContainer.create()
	const html = await container.renderToString(HelloWorld)
	expect(html).toMatch(/<h1[^>]*>Hello, World!<\/h1>/)
})

test("renders custom name", async () => {
	const container = await AstroContainer.create()
	const html = await container.renderToString(HelloWorld, {
		props: { name: "Astro" },
	})
	expect(html).toMatch(/<h1[^>]*>Hello, Astro!<\/h1>/)
})
