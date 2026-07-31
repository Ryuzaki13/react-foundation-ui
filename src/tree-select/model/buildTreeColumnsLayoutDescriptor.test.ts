import { describe, expect, it } from "vitest";

import { buildTreeColumnsLayoutDescriptor } from "./buildTreeColumnsLayoutDescriptor";

function buildDescriptor(levels: readonly number[]) {
	return buildTreeColumnsLayoutDescriptor(levels.map((level) => ({ level })));
}

describe("buildTreeColumnsLayoutDescriptor", () => {
	it("возвращает безопасный пустой descriptor", () => {
		expect(buildDescriptor([])).toEqual({
			itemCount: 0,
			groups: [],
			signature: "0|"
		});
	});

	it("разделяет preorder на последовательные root-группы", () => {
		expect(buildDescriptor([0, 1, 2, 1, 0, 1]).groups).toEqual([
			{
				startIndex: 0,
				endIndexExclusive: 4
			},
			{
				startIndex: 4,
				endIndexExclusive: 6
			}
		]);
	});

	it("сохраняет единые границы root-группы независимо от глубины descendants", () => {
		const descriptor = buildDescriptor([0, 1, 2, 2, 1, 1, 2]);

		expect(descriptor.groups).toEqual([
			{
				startIndex: 0,
				endIndexExclusive: 7
			}
		]);
	});

	it("меняет structural signature при другом составе групп с прежним числом строк", () => {
		const firstSignature = buildDescriptor([0, 1, 1, 1, 0, 1]).signature;
		const secondSignature = buildDescriptor([0, 1, 0, 1, 1, 1]).signature;

		expect(firstSignature).not.toBe(secondSignature);
	});
});
