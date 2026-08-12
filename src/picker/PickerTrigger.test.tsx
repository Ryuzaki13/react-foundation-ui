// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PickerTrigger } from "./PickerTrigger";

describe("PickerTrigger", () => {
	it("передаёт наличие выбранного значения как состояние overlay-контейнера", () => {
		const { rerender } = render(
			<PickerTrigger
				open={false}
				optionCount={2}
				value="Выбранное значение"
				selectedValue="Выбранное значение"
				readOnly
				onToggleClick={vi.fn()}
			/>
		);

		const input = screen.getByRole("textbox");
		expect(input.closest('[data-has-overlay="true"]')).toBeTruthy();
		expect(input).toHaveProperty("value", "Выбранное значение");

		rerender(<PickerTrigger open={false} optionCount={2} value="" readOnly onToggleClick={vi.fn()} />);

		expect(input.closest("[data-has-overlay]")).toBeNull();
	});
});
