import { describe, expect, it } from "vitest";

import { readFloatingWindowsPositions, serializeFloatingWindowsPositions } from "./floatingWindowsStorage";

describe("readFloatingWindowsPositions", () => {
	it.each(["", "{", "undefined", '{"version":1,"positions":[]} trailing'])("отклоняет повреждённый JSON: %j", (text) => {
		expect(() => readFloatingWindowsPositions(text)).toThrow();
	});

	it.each([
		null,
		[],
		1,
		"value",
		{},
		{ positions: [] },
		{ version: 0, positions: [] },
		{ version: 2, positions: [] },
		{ version: 1, positions: {} }
	])("отклоняет неизвестную версию и форму snapshot: %j", (value) => {
		expect(() => readFloatingWindowsPositions(JSON.stringify(value))).toThrow();
	});

	it.each([
		null,
		[],
		{},
		{ id: 1, x: 0, y: 0 },
		{ id: "", x: 0, y: 0 },
		{ id: " \t\n", x: 0, y: 0 },
		{ id: "a".repeat(257), x: 0, y: 0 },
		{ id: "a", x: "1", y: 0 },
		{ id: "a", x: null, y: 0 },
		{ id: "a", x: 0, y: null },
		{ id: "a", x: 0 }
	])("отклоняет некорректную запись позиции: %j", (entry) => {
		expect(() => readFloatingWindowsPositions(JSON.stringify({ version: 1, positions: [entry] }))).toThrow();
	});

	it("отклоняет повторные ID и переполнение числовых координат при JSON parsing", () => {
		expect(() =>
			readFloatingWindowsPositions(
				JSON.stringify({
					version: 1,
					positions: [
						{ id: "same", x: 1, y: 2 },
						{ id: "same", x: 3, y: 4 }
					]
				})
			)
		).toThrow();
		expect(() => readFloatingWindowsPositions('{"version":1,"positions":[{"id":"a","x":1e309,"y":0}]}')).toThrow();
		expect(() => readFloatingWindowsPositions('{"version":1,"positions":[{"id":"a","x":0,"y":-1e309}]}')).toThrow();
	});

	it("принимает предельные 200 записей и отклоняет следующую", () => {
		const positions = Array.from({ length: 201 }, (_, index) => ({ id: `window-${index}`, x: index, y: index }));
		expect(readFloatingWindowsPositions(JSON.stringify({ version: 1, positions: positions.slice(0, 200) })).size).toBe(200);
		expect(() => readFloatingWindowsPositions(JSON.stringify({ version: 1, positions }))).toThrow();
	});

	it("проверяет длину входа до parsing и допускает ровно 64 KiB символов", () => {
		const text = JSON.stringify({ version: 1, positions: [] });
		expect(readFloatingWindowsPositions(text.padEnd(64 * 1024)).size).toBe(0);
		expect(() => readFloatingWindowsPositions(text.padEnd(64 * 1024 + 1))).toThrow(/размер/);
	});

	it("сохраняет точные ID и конечные координаты, включая отрицательные и дробные", () => {
		const id = "a".repeat(256);
		const expected = new Map([
			[id, { x: -24.5, y: 0.125 }],
			["__proto__", { x: Number.MAX_VALUE, y: -Number.MAX_VALUE }],
			[" window ", { x: 1, y: 2 }]
		]);
		expect(readFloatingWindowsPositions(serializeFloatingWindowsPositions(expected))).toEqual(expected);
	});
});

describe("serializeFloatingWindowsPositions", () => {
	it("выполняет roundtrip и записывает только id/x/y", () => {
		const position = { x: 24, y: 48, title: "Не должно сохраняться", content: "Только координаты" };
		const source = new Map([["window", position]]);
		const text = serializeFloatingWindowsPositions(source);
		expect(JSON.parse(text)).toEqual({ version: 1, positions: [{ id: "window", x: 24, y: 48 }] });
		expect(readFloatingWindowsPositions(text)).toEqual(new Map([["window", { x: 24, y: 48 }]]));
		expect(serializeFloatingWindowsPositions(new Map())).toBe('{"version":1,"positions":[]}');
	});

	it("сохраняет последние 200 записей в исходном порядке без изменения Map", () => {
		const positions = new Map(Array.from({ length: 250 }, (_, index) => [`window-${index}`, { x: index, y: index }]));
		const restored = readFloatingWindowsPositions(serializeFloatingWindowsPositions(positions));
		expect(restored.size).toBe(200);
		expect([...restored.keys()]).toEqual([...positions.keys()].slice(-200));
		expect(positions.size).toBe(250);
	});

	it("ограничивает JSON с экранированными ID и сохраняет непрерывный хвост записей", () => {
		const positions = new Map(Array.from({ length: 200 }, (_, index) => [`${"\u0000".repeat(250)}${index}`, { x: index, y: index }]));
		const text = serializeFloatingWindowsPositions(positions);
		expect(text.length).toBeLessThanOrEqual(64 * 1024);
		const restored = readFloatingWindowsPositions(text);
		expect(restored.size).toBeGreaterThan(0);
		expect(restored.size).toBeLessThan(200);
		expect([...restored.keys()]).toEqual([...positions.keys()].slice(-restored.size));
		expect(serializeFloatingWindowsPositions(restored)).toBe(text);
	});

	it.each([NaN, Infinity, -Infinity])("явно отклоняет неконечную координату %s вместо записи null", (coordinate) => {
		expect(() => serializeFloatingWindowsPositions(new Map([["window", { x: coordinate, y: 0 }]]))).toThrow();
		expect(() => serializeFloatingWindowsPositions(new Map([["window", { x: 0, y: coordinate }]]))).toThrow();
	});

	it.each(["", " \n\t", "a".repeat(257)])("не создаёт нечитаемую запись для недопустимого ID: %j", (id) => {
		expect(() => serializeFloatingWindowsPositions(new Map([[id, { x: 1, y: 2 }]]))).toThrow();
	});
});
