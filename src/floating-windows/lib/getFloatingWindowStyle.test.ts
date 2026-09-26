import { describe, expect, it } from "vitest";

import { getFloatingWindowStyle } from "./getFloatingWindowStyle";

describe("getFloatingWindowStyle", () => {
	const snapshot = { position: { x: 100, y: 80 }, size: null, layer: 2 };
	it("ограничивает числовые размеры в SSR до измерения DOM", () => {
		expect(getFloatingWindowStyle(snapshot, 360, 300)).toEqual({
			width: 360,
			height: 300,
			zIndex: 2,
			left: "clamp(0px, 100px, max(0px, calc(100% - 360px)))",
			top: "clamp(0px, 80px, max(0px, calc(100% - 300px)))"
		});
	});
	it.each(["auto", "fit-content", "max-content", "50%", "24rem"])(
		"не подставляет %s в недействительный CSS calc до измерения",
		(dimension) => {
			expect(getFloatingWindowStyle(snapshot, dimension, dimension)).toMatchObject({ left: 0, top: 0 });
			const measured = getFloatingWindowStyle({ ...snapshot, size: { width: 320, height: 200 } }, dimension, dimension);
			expect(measured).toMatchObject({
				width: dimension,
				height: dimension,
				left: "clamp(0px, 100px, max(0px, calc(100% - 320px)))",
				top: "clamp(0px, 80px, max(0px, calc(100% - 200px)))"
			});
		}
	);
});
