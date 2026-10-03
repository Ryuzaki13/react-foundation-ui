import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { InputText } from "./Input";
import { InputTextSearchControlledFixture } from "./test-fixtures/InputTextSearchControlledFixture";

describe("InputText: одна очистка search-поля", () => {
	it.each([
		{ type: "search", customClear: true },
		{ type: "search", customClear: false },
		{ type: "text", customClear: true },
		{ type: "text", customClear: false }
	] as const)("type=$type, onClear=$customClear: семантика поля и единственная доступная очистка", ({ type, customClear }) => {
		const onClear = vi.fn();
		render(<InputText type={type} value="Значение" onChange={vi.fn()} onClear={customClear ? onClear : undefined} />);
		const input = screen.getByRole(type === "search" ? "searchbox" : "textbox");
		expect(input.getAttribute("type")).toBe(type);
		// jsdom не рисует UA-псевдоэлемент: эти проверки доказывают semantic/action
		// contract. Отсутствие второго видимого крестика проверяется в браузере.
		if (customClear) {
			const clear = screen.getByRole("button", { name: "Очистить значение" });
			expect(screen.getAllByRole("button")).toHaveLength(1);
			fireEvent.click(clear);
			expect(onClear).toHaveBeenCalledOnce();
		} else {
			expect(screen.queryByRole("button")).toBeNull();
		}
	});

	it("живой ввод обновляется до blur/Enter, доступная очистка вызывает onClear ровно один раз", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const onClear = vi.fn();
		render(<InputTextSearchControlledFixture onChange={onChange} onClear={onClear} />);
		const input = screen.getByRole("searchbox");
		const blur = vi.fn();
		const keydown = vi.fn<(event: KeyboardEvent) => void>();
		input.addEventListener("blur", blur);
		input.addEventListener("keydown", keydown);
		await user.type(input, " поиск");
		expect(input.getAttribute("type")).toBe("search");
		expect(input).toHaveProperty("value", "Исходное поиск");
		expect(document.activeElement).toBe(input);
		expect(onChange).toHaveBeenLastCalledWith("Исходное поиск");
		expect(blur).not.toHaveBeenCalled();
		expect(keydown.mock.calls.some(([event]) => event.key === "Enter")).toBe(false);
		const changesBeforeClear = onChange.mock.calls.length;
		const clear = screen.getByRole("button", { name: "Очистить значение" });
		expect(screen.getAllByRole("button")).toHaveLength(1);
		await user.click(clear);
		expect(onClear).toHaveBeenCalledOnce();
		expect(onChange).toHaveBeenCalledTimes(changesBeforeClear);
		expect(input).toHaveProperty("value", "");
		expect(clear).toHaveProperty("disabled", true);
		await user.click(clear);
		expect(onClear).toHaveBeenCalledOnce();
	});

	it("удаление onClear убирает собственную команду без смены input или search-семантики", () => {
		const props = { type: "search", value: "Поиск", onChange: vi.fn() } as const;
		const mounted = render(<InputText {...props} onClear={vi.fn()} />);
		const input = screen.getByRole("searchbox");
		expect(screen.getByRole("button", { name: "Очистить значение" })).toBeDefined();
		mounted.rerender(<InputText {...props} />);
		expect(screen.getByRole("searchbox")).toBe(input);
		expect(input.getAttribute("type")).toBe("search");
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("SSR сохраняет type=search в обоих режимах очистки", () => {
		const props = { type: "search", value: "Поиск", onChange: vi.fn() } as const;
		const nativeMarkup = renderToStaticMarkup(<InputText {...props} />);
		const customMarkup = renderToStaticMarkup(<InputText {...props} onClear={vi.fn()} />);
		expect(nativeMarkup).toContain('type="search"');
		expect(customMarkup).toContain('type="search"');
	});
});
