// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SingleDateTimeInput, type SingleDateTimeInputProps } from "./SingleDateTimeInput";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom не реализует прокрутку, которая запускается wheel-picker при открытии панели.
Object.defineProperty(HTMLElement.prototype, "scrollTo", {
	configurable: true,
	value: () => {}
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function DateTimeHarness({ mode, onChange }: Partial<Pick<SingleDateTimeInputProps, "mode" | "onChange">>) {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3, 12, 30));

	return (
		<>
			<SingleDateTimeInput
				label="Дата и время"
				mode={mode}
				value={value}
				onChange={(next) => {
					setValue(next);
					onChange?.(next);
				}}
			/>
			<button type="button" onClick={() => setValue(new Date(2027, 3, 4, 9, 45))}>
				Внешнее значение
			</button>
		</>
	);
}

function getSegment(label: string) {
	return container?.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
	const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
	valueSetter?.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
}

afterEach(async () => {
	if (root) {
		await act(async () => root?.unmount());
	}

	container?.remove();
	container = null;
	root = null;
});

describe("SingleDateTimeInput", () => {
	it("описывает сегментное поле и popup без недопустимых ARIA-атрибутов", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () =>
			root?.render(
				<SingleDateTimeInput
					label="Дата и время"
					description="Укажите момент события"
					placeholder="дд.мм.гггг чч:мм"
					value={new Date(2026, 2, 3, 12, 30)}
					onChange={() => {}}
				/>
			)
		);

		const group = container.querySelector('[role="group"]');
		const trigger = container.querySelector('button[aria-label="Открыть календарь даты и времени"]') as HTMLButtonElement;
		expect(group?.hasAttribute("aria-placeholder")).toBe(false);
		expect(group?.getAttribute("aria-description")).toBe("дд.мм.гггг чч:мм");
		expect(document.getElementById(group?.getAttribute("aria-labelledby") ?? "")?.textContent).toBe("Дата и время");
		expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(trigger.parentElement?.hasAttribute("aria-expanded")).toBe(false);

		await act(async () => trigger.click());

		const dialog = document.querySelector('[role="dialog"][aria-label="Выбор даты и времени"]');
		expect(dialog?.id).toBe(trigger.getAttribute("aria-controls"));
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
	});

	it("отбрасывает незавершённые сегменты после смены controlled value", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => root?.render(<DateTimeHarness />));
		expect(getSegment("День").value).toBe("03");

		await act(async () => setNativeInputValue(getSegment("День"), "0"));
		expect(getSegment("День").value).toBe("0");

		await act(async () => {
			Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? [])
				.find((button) => button.textContent === "Внешнее значение")
				?.click();
		});

		expect(getSegment("День").value).toBe("04");
		expect(getSegment("Месяц").value).toBe("04");
		expect(getSegment("Год").value).toBe("2027");
		expect(getSegment("Часы").value).toBe("09");
		expect(getSegment("Минуты").value).toBe("45");
	});

	it("очищает время из поля и отбрасывает выбор в открытой панели", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		const onChange = vi.fn();
		await act(async () => root?.render(<DateTimeHarness mode="time" onChange={onChange} />));

		const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Открыть выбор времени"]')!;
		await act(async () => trigger.click());
		const hours = document.querySelector('[role="listbox"][aria-label="Выбор часов"]')!;
		await act(async () => hours.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
		expect(hours.querySelector('[aria-selected="true"]')?.textContent).toBe("13");

		const clear = container.querySelector<HTMLButtonElement>('button[aria-label="Очистить поле «Дата и время»"]')!;
		await act(async () => {
			clear.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
			clear.click();
		});

		expect(onChange.mock.calls).toEqual([[null]]);
		expect(document.querySelector('[role="dialog"]')).toBeNull();
		expect(getSegment("Часы").value).toBe("");
		expect(getSegment("Минуты").value).toBe("");
		expect(clear.disabled).toBe(true);
		await vi.waitFor(() => expect(document.activeElement).toBe(getSegment("Часы")));
	});

	it("очищает частичный ввод при пустом value и учитывает блокировку поля", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		const onChange = vi.fn();
		await act(async () => root?.render(<SingleDateTimeInput value={null} onChange={onChange} />));
		const clear = container.querySelector<HTMLButtonElement>('[data-action="clear-input"]')!;
		expect(clear.disabled).toBe(true);

		await act(async () => setNativeInputValue(getSegment("День"), "1"));
		expect(clear.disabled).toBe(false);
		await act(async () => clear.click());
		expect(getSegment("День").value).toBe("");
		expect(onChange.mock.calls).toEqual([[null]]);

		await act(async () => root?.render(<SingleDateTimeInput value={new Date(2026, 2, 3)} onChange={onChange} disabled />));
		expect(clear.disabled).toBe(true);
		await act(async () => clear.click());
		expect(getSegment("День").value).toBe("03");
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
