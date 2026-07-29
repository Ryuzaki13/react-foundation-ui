// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StringToggle } from "./StringToggle";

describe("StringToggle", () => {
	it("преобразует оба состояния в настроенные строки", () => {
		const onChange = vi.fn<(value: string) => void>();
		const view = render(
			<StringToggle
				checkedText="за клиента"
				uncheckedText="за сделку"
				checkedValue="ZM_MANAGER"
				uncheckedValue="ZBP_MANAGER"
				value="ZBP_MANAGER"
				onChange={onChange}
			/>
		);
		const toggle = screen.getByRole("switch", { name: "за сделку / за клиента" }) as HTMLInputElement;

		expect(toggle.checked).toBe(false);
		fireEvent.click(toggle);
		expect(onChange).toHaveBeenLastCalledWith("ZM_MANAGER");

		view.rerender(
			<StringToggle
				checkedText="за клиента"
				uncheckedText="за сделку"
				checkedValue="ZM_MANAGER"
				uncheckedValue="ZBP_MANAGER"
				value="ZM_MANAGER"
				onChange={onChange}
			/>
		);

		expect(toggle.checked).toBe(true);
		fireEvent.click(toggle);
		expect(onChange).toHaveBeenLastCalledWith("ZBP_MANAGER");
	});

	it("не нормализует пустую строку и пробелы в значениях состояний", () => {
		const onChange = vi.fn<(value: string) => void>();
		const view = render(<StringToggle checkedValue=" ZM_MANAGER " uncheckedValue="" value="" onChange={onChange} />);
		const toggle = screen.getByRole("switch") as HTMLInputElement;

		fireEvent.click(toggle);
		expect(onChange).toHaveBeenLastCalledWith(" ZM_MANAGER ");

		view.rerender(<StringToggle checkedValue=" ZM_MANAGER " uncheckedValue="" value=" ZM_MANAGER " onChange={onChange} />);
		fireEvent.click(toggle);
		expect(onChange).toHaveBeenLastCalledWith("");
	});

	it("использует строковые boolean-значения по умолчанию и остаётся controlled", () => {
		const onChange = vi.fn<(value: string) => void>();

		render(<StringToggle value="false" defaultChecked onChange={onChange} />);
		const toggle = screen.getByRole("switch") as HTMLInputElement;

		expect(toggle.checked).toBe(false);
		fireEvent.click(toggle);
		expect(onChange).toHaveBeenCalledWith("true");
	});
});
