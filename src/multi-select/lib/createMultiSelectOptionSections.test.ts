import { describe, expect, it } from "vitest";

import { createMultiSelectOptionSections } from "./createMultiSelectOptionSections";

type TestOption = {
	id: string;
	group?: string;
};

describe("createMultiSelectOptionSections", () => {
	it("объединяет только соседние группы и сохраняет глобальные индексы строк", () => {
		const entries = [
			{ option: { id: "a-1", group: "a" }, index: 3 },
			{ option: { id: "a-2", group: "a" }, index: 4 },
			{ option: { id: "plain" }, index: 7 },
			{ option: { id: "a-3", group: "a" }, index: 9 },
			{ option: { id: "b-1", group: "b" }, index: 12 }
		] satisfies ReadonlyArray<{ option: TestOption; index: number }>;

		const sections = createMultiSelectOptionSections(entries, (option) =>
			option.group ? { key: option.group, label: option.group.toUpperCase() } : undefined
		);

		expect(
			sections.map((section) => ({
				group: section.group?.key,
				ids: section.entries.map(({ option }) => option.id),
				indexes: section.entries.map(({ index }) => index)
			}))
		).toEqual([
			{ group: "a", ids: ["a-1", "a-2"], indexes: [3, 4] },
			{ group: undefined, ids: ["plain"], indexes: [7] },
			{ group: "a", ids: ["a-3"], indexes: [9] },
			{ group: "b", ids: ["b-1"], indexes: [12] }
		]);
	});
});
