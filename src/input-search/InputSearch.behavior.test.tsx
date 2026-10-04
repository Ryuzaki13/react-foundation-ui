import { StrictMode } from "react";

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ControlledInputSearchFixture } from "./test-fixtures/ControlledInputSearchFixture";

import { InputSearch } from "./index";

describe("InputSearch: черновик и внешний подтверждённый запрос", () => {
	it("сообщает обрезанный запрос по Enter и не повторяет его при blur", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		fireEvent.change(input, { target: { value: "  beta  " } });
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onChange).toHaveBeenCalledExactlyOnceWith("beta");
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledOnce();
	});

	it("подтверждает черновик при blur", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="alpha" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		fireEvent.change(input, { target: { value: "  beta  " } });
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledExactlyOnceWith("beta");
	});

	it("не теряет фокус при возврате подтверждённого Enter через controlled value", () => {
		const onChange = vi.fn();
		const mounted = render(<ControlledInputSearchFixture onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		fireEvent.change(input, { target: { value: "beta" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onChange).toHaveBeenCalledExactlyOnceWith("beta");
		expect(mounted.getByRole("textbox")).toBe(input);
		expect(document.activeElement).toBe(input);
		expect(input).toHaveProperty("value", "beta");
	});

	it("сохраняет незавершённый черновик при неизменном value и обычном rerender", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="alpha" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		fireEvent.change(input, { target: { value: "alpha draft" } });
		mounted.rerender(<InputSearch value="alpha" onChange={onChange} maxLength={255} />);
		expect(mounted.getByRole("textbox")).toBe(input);
		expect(input).toHaveProperty("value", "alpha draft");
		expect(document.activeElement).toBe(input);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("цикл истории alpha → beta → alpha заменяет черновик и guard без remount в StrictMode", () => {
		const onChange = vi.fn();
		const mounted = render(
			<StrictMode>
				<InputSearch value="alpha" onChange={onChange} />
			</StrictMode>
		);
		const input = mounted.getByRole("textbox");
		input.focus();

		fireEvent.change(input, { target: { value: "alpha stale draft" } });
		mounted.rerender(
			<StrictMode>
				<InputSearch value="beta" onChange={onChange} />
			</StrictMode>
		);
		expect(input).toHaveProperty("value", "beta");
		fireEvent.keyDown(input, { key: "Enter" });
		mounted.rerender(
			<StrictMode>
				<InputSearch value="alpha" onChange={onChange} />
			</StrictMode>
		);
		expect(input).toHaveProperty("value", "alpha");
		expect(mounted.getByRole("textbox")).toBe(input);
		expect(document.activeElement).toBe(input);
		fireEvent.blur(input);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("внешняя очистка сбрасывает черновик без нового callback", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="alpha" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		fireEvent.change(input, { target: { value: "alpha draft" } });
		mounted.rerender(<InputSearch value="" onChange={onChange} />);
		expect(input).toHaveProperty("value", "");
		expect(document.activeElement).toBe(input);
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onChange).not.toHaveBeenCalled();
	});

	it("defaultValue остаётся начальным значением и не стирает последующий локальный ввод", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="" defaultValue="alpha" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		expect(input).toHaveProperty("value", "alpha");
		fireEvent.change(input, { target: { value: "alpha draft" } });
		mounted.rerender(<InputSearch value="" defaultValue="ignored" onChange={onChange} />);
		expect(input).toHaveProperty("value", "alpha draft");
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onChange).toHaveBeenCalledExactlyOnceWith("alpha draft");
	});

	it("defaultValue не мешает последующему внешнему value заменить поле", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="alpha" defaultValue="initial" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		expect(input).toHaveProperty("value", "initial");
		mounted.rerender(<InputSearch value="beta" defaultValue="initial" onChange={onChange} />);
		expect(input).toHaveProperty("value", "beta");
		fireEvent.blur(input);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("публичная очистка подтверждает пустой поиск один раз и не повторяет его на blur", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="alpha" onChange={onChange} />);
		const input = mounted.getByRole("textbox");
		input.focus();

		// Нажатие кнопки является public IO поля, а её текст и внутренние классы не являются контрактом теста.
		fireEvent.click(mounted.getByRole("button"));
		expect(input).toHaveProperty("value", "");
		expect(onChange).toHaveBeenCalledExactlyOnceWith("");
		fireEvent.blur(input);
		expect(onChange).toHaveBeenCalledOnce();
	});

	it("disabled блокирует нативный ввод и очистку", () => {
		const onChange = vi.fn();
		const mounted = render(<InputSearch value="alpha" onChange={onChange} disabled />);

		expect(mounted.getByRole("textbox")).toHaveProperty("disabled", true);
		expect(mounted.getByRole("button")).toHaveProperty("disabled", true);
		expect(onChange).not.toHaveBeenCalled();
	});
});
