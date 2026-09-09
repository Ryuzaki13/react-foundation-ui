// @vitest-environment jsdom

import { act, type ReactNode } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Listbox } from "./Listbox";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const scrollIntoView = vi.fn();

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
	configurable: true,
	value: scrollIntoView
});

const OPTIONS = [
	{ value: "day", label: "День" },
	{ value: "week", label: "Неделя" },
	{ value: "month", label: "Месяц" }
];

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function getRequiredElement<TElement extends Element>(element: TElement | null, message: string): TElement {
	if (!element) {
		throw new Error(message);
	}

	return element;
}

async function renderNode(node: ReactNode) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root?.render(node);
	});
}

afterEach(async () => {
	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = null;
	}

	container?.remove();
	container = null;
	document.body.innerHTML = "";
	scrollIntoView.mockClear();
});

describe("Listbox", () => {
	it("переиспользует подпись и описание Input и связывает их со списком через ARIA", async () => {
		await renderNode(
			<Listbox
				id="schedule-period"
				label="Период расписания"
				description="Можно выбрать только один период."
				options={OPTIONS}
				value="week"
				onChange={() => undefined}
			/>
		);

		const label = getRequiredElement(container?.querySelector<HTMLLabelElement>("label") ?? null, "Не найдена подпись Listbox");
		const description = getRequiredElement(
			container?.querySelector<HTMLParagraphElement>("#schedule-period-description") ?? null,
			"Не найдено описание Listbox"
		);
		const listbox = getRequiredElement(container?.querySelector<HTMLElement>('[role="listbox"]') ?? null, "Не найден Listbox");

		expect(label.textContent).toBe("Период расписания");
		expect(label.htmlFor).toBe("schedule-period");
		expect(label.id).toBe("schedule-period-label");
		expect(description.textContent).toBe("Можно выбрать только один период.");
		expect(listbox.getAttribute("aria-labelledby")).toBe(label.id);
		expect(listbox.getAttribute("aria-describedby")).toBe(description.id);
	});

	it("не прокручивает внешнюю страницу при монтировании и прокручивает активную опцию только после клавиатурной навигации", async () => {
		await renderNode(<Listbox options={OPTIONS} value="week" onChange={() => undefined} />);

		const listbox = getRequiredElement(container?.querySelector<HTMLElement>('[role="listbox"]') ?? null, "Не найден Listbox");
		expect(scrollIntoView).not.toHaveBeenCalled();

		await act(async () => {
			listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		});

		expect(scrollIntoView).toHaveBeenCalledOnce();
		expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
	});

	it("в disabled состоянии исключает список из tab-порядка и блокирует клавиатурный и указательный выбор", async () => {
		const onChange = vi.fn();
		await renderNode(<Listbox disabled options={OPTIONS} value="week" onChange={onChange} />);

		const listbox = getRequiredElement(container?.querySelector<HTMLElement>('[role="listbox"]') ?? null, "Не найден Listbox");
		const monthOption = getRequiredElement(
			container?.querySelector<HTMLElement>('[role="option"]:last-child') ?? null,
			"Не найдена опция «Месяц»"
		);

		expect(listbox.getAttribute("aria-disabled")).toBe("true");
		expect(listbox.tabIndex).toBe(-1);
		expect(monthOption.getAttribute("aria-disabled")).toBe("true");

		await act(async () => {
			listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
			listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
			monthOption.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		});

		expect(onChange).not.toHaveBeenCalled();
		expect(scrollIntoView).not.toHaveBeenCalled();
	});
});
