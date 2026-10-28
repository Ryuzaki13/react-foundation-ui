// @vitest-environment jsdom

import { act, type ReactNode } from "react";

import { type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RangeDateInput, SingleDateInput } from "./index";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
});

afterEach(async () => {
	await act(async () => root?.unmount());
	host?.remove();
	document.body.innerHTML = "";
	vi.unstubAllGlobals();
});

async function render(node: ReactNode) {
	await act(async () => root?.render(node));
}

function input(): HTMLInputElement {
	const field = host?.querySelector<HTMLInputElement>("input[type='text']");
	if (!field) {
		throw new Error("Поле даты не создано.");
	}

	return field;
}

function button(action: string): HTMLButtonElement {
	const control = host?.querySelector<HTMLButtonElement>(`[data-action="${action}"]`);
	if (!control) {
		throw new Error(`Не найдено действие ${action}.`);
	}

	return control;
}

async function typeText(text: string) {
	await act(async () => {
		const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
		if (!setter) {
			throw new Error("Нативный setter ввода недоступен.");
		}

		setter.call(input(), text);
		input().dispatchEvent(new Event("input", { bubbles: true }));
	});
}

describe("встроенная очистка DateInput", () => {
	it("очищает одну дату в null и возвращает фокус в тот же input", async () => {
		const onChange = vi.fn<(value: Date | null) => void>();
		await render(<SingleDateInput clearable value={new Date(2026, 2, 3)} onChange={onChange} />);
		const field = input();

		await act(async () => {
			button("clear-input").focus();
			button("clear-input").click();
		});

		expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
		expect(field.value).toBe("");
		expect(document.activeElement).toBe(field);
		expect(input()).toBe(field);
	});

	it("очищает диапазон при открытом календаре и не возвращает его после закрытия", async () => {
		const onChange = vi.fn<(value: NullableDateRange | null) => void>();
		const range: NullableDateRange = [new Date(2026, 2, 3), new Date(2026, 2, 8)];
		await render(<RangeDateInput clearable value={range} onChange={onChange} />);
		await act(async () => button("open-calendar").click());
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();

		await act(async () => button("clear-input").click());
		await render(<RangeDateInput clearable value={null} onChange={onChange} />);
		expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
		expect(input().value).toBe("");
		expect(document.activeElement).toBe(input());

		await act(async () => button("open-calendar").click());
		await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
		expect(input().value).toBe("");
		expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
	});

	it("очищает незавершённый календарный выбор, не публикуя частичный диапазон", async () => {
		const onChange = vi.fn<(value: NullableDateRange | null) => void>();
		await render(<RangeDateInput clearable value={null} onChange={onChange} />);
		await act(async () => button("open-calendar").click());
		const day = document.querySelector<HTMLButtonElement>('[data-action="select-calendar-day"]:not([disabled])');
		if (!day) {
			throw new Error("Доступный день календаря не найден.");
		}

		await act(async () => day.click());
		expect(onChange).not.toHaveBeenCalled();
		expect(input().value).not.toBe("");
		await act(async () => button("clear-input").click());

		expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
		expect(input().value).toBe("");
	});

	it("отмена незавершённого диапазона восстанавливает applied value без дополнительного onChange", async () => {
		const onChange = vi.fn<(value: NullableDateRange | null) => void>();
		const range: NullableDateRange = [new Date(2026, 2, 3), new Date(2026, 2, 8)];
		await render(<RangeDateInput clearable value={range} onChange={onChange} />);
		const before = input().value;
		await act(async () => button("open-calendar").click());
		const day = document.querySelector<HTMLButtonElement>('[data-action="select-calendar-day"]:not([disabled])');
		if (!day) {
			throw new Error("Доступный день календаря не найден.");
		}

		await act(async () => day.click());
		expect(onChange).not.toHaveBeenCalled();
		await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));

		expect(input().value).toBe(before);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("очистка удаляет неверный текст и не блокируется календарными границами", async () => {
		const onChange = vi.fn<(value: Date | null) => void>();
		const date = new Date(2026, 2, 3);
		await render(<SingleDateInput clearable value={date} minDate={date} maxDate={date} onChange={onChange} />);
		await typeText("не дата");
		await act(async () => button("clear-input").click());

		expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
		expect(input().value).toBe("");
	});

	it.each(["blur", "Enter"])("пустой ручной ввод применяет null через %s ровно один раз", async (event) => {
		const onChange = vi.fn<(value: Date | null) => void>();
		await render(<SingleDateInput clearable value={new Date(2026, 2, 3)} onChange={onChange} />);
		await act(async () => input().focus());
		await typeText("");
		await act(async () => {
			if (event === "blur") {
				input().blur();
			} else {
				input().dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
			}
		});
		await act(async () => input().blur());

		expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
	});

	it("disabled блокирует очистку, а без clearable прежний контракт не меняется", async () => {
		const onChange = vi.fn<(value: Date | null) => void>();
		const value = new Date(2026, 2, 3);
		await render(<SingleDateInput clearable disabled value={value} onChange={onChange} />);
		expect(button("clear-input").disabled).toBe(true);
		await act(async () => button("clear-input").click());
		expect(onChange).not.toHaveBeenCalled();

		await render(<SingleDateInput value={value} onChange={onChange} />);
		expect(host?.querySelector('[data-action="clear-input"]')).toBeNull();
		await act(async () => input().focus());
		await typeText("");
		await act(async () => input().blur());
		expect(onChange).not.toHaveBeenCalled();
	});

	it("переход внешнего value A → B → A не воскрешает draft и сохраняет input DOM и фокус", async () => {
		const onChange = vi.fn<(value: NullableDateRange | null) => void>();
		const first: NullableDateRange = [new Date(2026, 2, 3), new Date(2026, 2, 8)];
		const second: NullableDateRange = [new Date(2026, 3, 4), new Date(2026, 3, 9)];
		await render(<RangeDateInput clearable value={first} onChange={onChange} />);
		const field = input();
		const initialText = field.value;
		await act(async () => field.focus());
		await typeText("03.03.2");

		await render(<RangeDateInput clearable value={second} onChange={onChange} />);
		expect(field.value).not.toBe("03.03.2");
		await render(<RangeDateInput clearable value={first} onChange={onChange} />);

		expect(input()).toBe(field);
		expect(document.activeElement).toBe(field);
		expect(field.value).toBe(initialText);
		expect(onChange).not.toHaveBeenCalled();
	});
});
