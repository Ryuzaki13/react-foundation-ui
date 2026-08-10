import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useODataDependentSelection } from "./useODataDependentSelection";

const segmentOrder = ["REGION", "BRANCH", "TEAM"] as const;

describe("useODataDependentSelection", () => {
	it("хранит общий uncontrolled-снимок и публикует независимое изменение сегмента", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useODataDependentSelection({
				defaultValues: { REGION: ["R01"] },
				onChange
			})
		);

		act(() => result.current.updateSegment("BRANCH", ["B0101", "B0102"]));

		expect(result.current.values).toEqual({
			REGION: ["R01"],
			BRANCH: ["B0101", "B0102"]
		});
		expect(onChange).toHaveBeenCalledWith({
			REGION: ["R01"],
			BRANCH: ["B0101", "B0102"]
		});
	});

	it("оставляет controlled-снимок источником истины", () => {
		const onChange = vi.fn();
		const controlledValues = { REGION: ["R01"] };
		const { result } = renderHook(() => useODataDependentSelection({ values: controlledValues, onChange }));

		act(() => result.current.updateSegment("BRANCH", ["B0101"]));

		expect(result.current.values).toBe(controlledValues);
		expect(onChange).toHaveBeenCalledWith({ REGION: ["R01"], BRANCH: ["B0101"] });
		expect(controlledValues).toEqual({ REGION: ["R01"] });
	});

	it("открывает sequential-уровни только после заполнения всего предыдущего пути", () => {
		const { result } = renderHook(() =>
			useODataDependentSelection({
				selectionMode: "sequential",
				segmentOrder
			})
		);

		expect(result.current.isSegmentDisabled("REGION")).toBe(false);
		expect(result.current.isSegmentDisabled("BRANCH")).toBe(true);
		expect(result.current.isSegmentDisabled("TEAM")).toBe(true);

		act(() => result.current.updateSegment("REGION", ["R01"]));

		expect(result.current.isSegmentDisabled("BRANCH")).toBe(false);
		expect(result.current.isSegmentDisabled("TEAM")).toBe(true);

		act(() => result.current.updateSegment("BRANCH", ["B0101"]));

		expect(result.current.isSegmentDisabled("TEAM")).toBe(false);
	});

	it("не позволяет обновить заблокированный или отсутствующий в sequential-порядке сегмент", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useODataDependentSelection({
				selectionMode: "sequential",
				segmentOrder,
				onChange
			})
		);

		act(() => {
			result.current.updateSegment("BRANCH", ["B0101"]);
			result.current.updateSegment("UNKNOWN", ["X"]);
		});

		expect(result.current.values).toEqual({});
		expect(result.current.isSegmentDisabled("UNKNOWN")).toBe(true);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("сбрасывает только последующие уровни текущей sequential-цепочки", () => {
		const { result } = renderHook(() =>
			useODataDependentSelection({
				defaultValues: {
					REGION: ["R01"],
					BRANCH: ["B0101"],
					TEAM: ["T0101"],
					UNRELATED: ["U01"]
				},
				selectionMode: "sequential",
				segmentOrder
			})
		);

		act(() => result.current.updateSegment("REGION", ["R02"]));

		expect(result.current.values).toEqual({
			REGION: ["R02"],
			BRANCH: [],
			TEAM: [],
			UNRELATED: ["U01"]
		});
	});
});
