// @vitest-environment node

import { isRecord } from "@ryuzaki13/react-foundation-lib/validators";
import { describe, expect, it } from "vitest";

import createViteConfig from "../../../vite.config";

import { existsSync, readFileSync, statSync } from "node:fs";

/** Проверяет фактический manifest и build config, а не копию перечня export names. */
describe("доставка public JavaScript entrypoints пакета", () => {
	it("каждый объявленный JS export имеет entry существующего source-файла", async () => {
		const manifest: unknown = JSON.parse(readFileSync(new URL("../../../package.json", import.meta.url), "utf8"));
		if (!isRecord(manifest) || !isRecord(manifest.exports)) throw new Error("Package manifest не содержит export map");
		const config = await createViteConfig({ command: "build", mode: "production" });
		const library = config.build?.lib;
		if (!library || !isRecord(library.entry)) throw new Error("Build не задаёт именованные library entries");
		let declaredEntries = 0;
		for (const [subpath, declaration] of Object.entries(manifest.exports)) {
			if (!isRecord(declaration) || typeof declaration.import !== "string" || !declaration.import.endsWith(".js")) continue;
			declaredEntries += 1;
			expect(declaration.import.startsWith("./dist/"), subpath).toBe(true);
			const entryName = declaration.import.slice("./dist/".length, -".js".length);
			const sourceFile = library.entry[entryName];
			if (typeof sourceFile !== "string") throw new Error("Объявленный JS export не включён в build: " + subpath);
			expect(existsSync(sourceFile), subpath).toBe(true);
			expect(statSync(sourceFile).isFile(), subpath).toBe(true);
		}
		expect(declaredEntries).toBeGreaterThan(0);
	});
});
