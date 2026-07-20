import { describe, expect, it } from "vitest";

import { resolveBalancedTreeColumnsLayout } from "./resolveBalancedTreeColumnsLayout";

const desktopGeometry = {
	availableWidth: 1424,
	availableHeight: 860,
	viewportWidth: 1440,
	viewportHeight: 900,
	referenceWidth: 224
};

describe("resolveBalancedTreeColumnsLayout", () => {
	it.each([
		[0, 1, 0],
		[5, 1, 5],
		[12, 2, 6],
		[24, 3, 8],
		[80, 5, 16]
	])("балансирует %i опций в %i колонок по %i строк", (itemCount, columnCount, rowCount) => {
		expect(resolveBalancedTreeColumnsLayout({ ...desktopGeometry, itemCount })).toMatchObject({
			columnCount,
			rowCount
		});
	});

	it("сводит раскладку к одной колонке в узком viewport", () => {
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			itemCount: 24,
			availableWidth: 299,
			viewportWidth: 315
		});

		expect(layout.columnCount).toBe(1);
		expect(layout.width).toBeLessThanOrEqual(299);
	});

	it("ограничивает размеры доступной областью и 75% высоты viewport", () => {
		const layout = resolveBalancedTreeColumnsLayout({
			...desktopGeometry,
			itemCount: 200,
			availableWidth: 740,
			availableHeight: 500,
			viewportWidth: 756,
			viewportHeight: 300,
			referenceWidth: 900
		});

		expect(layout.width).toBeLessThanOrEqual(740);
		expect(layout.minWidth).toBeLessThanOrEqual(740);
		expect(layout.maxHeight).toBe(225);
	});
});
