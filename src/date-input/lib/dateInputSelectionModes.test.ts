import { describe, expect, it } from "vitest";

import {
	DATE_INPUT_SELECTION_MODES,
	normalizeDateInputSelectionModes,
	resolveDateInputSelectionModeOptionsByModes
} from "./dateInputSelectionModes";

describe("dateInputSelectionModes", () => {
	it("сохраняет пользовательский порядок и удаляет неизвестные режимы и дубли", () => {
		expect(normalizeDateInputSelectionModes(["year", "unknown", "week", "year"])).toEqual(["year", "week"]);
	});

	it("возвращает полный набор для отсутствующего сохранённого значения", () => {
		expect(normalizeDateInputSelectionModes(undefined)).toEqual(DATE_INPUT_SELECTION_MODES);
	});

	it("разрешает описания в порядке сохранённых режимов", () => {
		expect(resolveDateInputSelectionModeOptionsByModes(["month", "day"])).toEqual([
			{ id: "month", label: "Месяц" },
			{ id: "day", label: "День" }
		]);
	});
});
