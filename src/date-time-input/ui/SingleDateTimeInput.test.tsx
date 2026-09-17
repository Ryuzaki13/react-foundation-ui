// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { SingleDateTimeInput } from "./SingleDateTimeInput";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom не реализует прокрутку, которая запускается wheel-picker при открытии панели.
Object.defineProperty(HTMLElement.prototype, "scrollTo", {
	configurable: true,
	value: () => {}
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function DateTimeHarness() {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3, 12, 30));

	return (
		<>
			<SingleDateTimeInput label="Дата и время" value={value} onChange={setValue} />
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
});
