import type { Linter } from "eslint";

const ignoresConfig: Linter.Config = {
	ignores: [
		"node_modules",
		"dist",
		"build",
		".output",
		".tanstack",
		"temp",
		"scripts",
		"storybook",
		"storybook-static",
		".storybook",
		"src/app/routeTree.gen.ts",
		"vite.config.*",
		"*.config.*",
		"**/*.d.ts"
	]
};

export default ignoresConfig;
