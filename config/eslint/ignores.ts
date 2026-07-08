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
		"**/*.d.ts",
		"src/**/*OData*.ts",
		"src/**/*OData*.tsx",
		"src/select/model/useODataSelect.ts",
		"src/select/model/useODataSelectBase.ts",
		"src/multi-select/model/useODataMultiSelect.ts",
		"src/tree-select/model/useODataTreeData.ts",
		"src/tree-select/model/resolveOrderedTreeSegmentItems.ts",
		"src/tree-select/model/resolveOrderedTreeSegmentItems.test.ts",
		"src/table/stories/Table.stories.tsx",
		"src/tree-table/stories/TreeTable.stories.tsx",
		"src/select/stories/odataStoryCollection.ts",
		"src/select/stories/odataStoryFixtures.tsx"
	]
};

export default ignoresConfig;
