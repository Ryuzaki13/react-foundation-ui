// @vitest-environment jsdom

import { act, type ReactNode, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RangeDateInput, SingleDateInput, type DateSingleInputProps } from "./DateInput";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderNode(node: ReactNode) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root!.render(node);
	});
}

function setNativeInputValue(input: HTMLInputElement, value: string) {
	const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
	valueSetter?.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function blurText(value: string): Promise<HTMLInputElement> {
	const input = container?.querySelector<HTMLInputElement>("input[type='text']");
	if (!input) throw new Error("DateInput не создал текстовое поле.");
	await act(async () => input.focus());
	await act(async () => setNativeInputValue(input, value));
	await act(async () => input.blur());
	return input;
}

type BoundedTextCase = Pick<DateSingleInputProps, "value" | "minDate" | "maxDate" | "selectionMode"> &
	Readonly<{ name: string; text: string }>;

function ControlledSingleDateInput({ datePreset, onCommit }: { datePreset?: string; onCommit: (value: Date | null) => void }) {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3, 12, 30, 0));

	const handleChange = (nextValue: Date | null) => {
		onCommit(nextValue);
		setValue(nextValue);
	};

	return <SingleDateInput label="Дата" datePreset={datePreset} value={value} onChange={handleChange} />;
}

function ExternallyControlledSingleDateInput() {
	const [value, setValue] = useState<Date | null>(new Date(2026, 2, 3));

	return (
		<>
			<SingleDateInput label="Дата" value={value} onChange={setValue} />
			<button type="button" onClick={() => setValue(new Date(2027, 3, 4))}>
				Внешнее значение
			</button>
		</>
	);
}

afterEach(async () => {
	vi.useRealTimers();

	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = null;
	}

	container?.remove();
	container = null;
	document.body.innerHTML = "";
});

describe("SingleDateInput", () => {
	it.each([
		{ name: "день перед min", value: new Date(2026, 2, 4), minDate: new Date(2026, 2, 3), text: "02.03.2026" },
		{ name: "день после max", value: new Date(2026, 2, 4), maxDate: new Date(2026, 2, 5), text: "06.03.2026" },
		{ name: "неделя перед min", value: new Date(2026, 7, 3), minDate: new Date(2026, 7, 3), selectionMode: "week", text: "01.08.2026" },
		{
			name: "неделя после max",
			value: new Date(2026, 7, 3),
			maxDate: new Date(2026, 7, 15),
			selectionMode: "week",
			text: "17.08.2026"
		},
		{
			name: "понедельник вне min",
			value: new Date(2026, 7, 10),
			minDate: new Date(2026, 7, 4),
			selectionMode: "week",
			text: "06.08.2026"
		},
		{ name: "суббота вне max", value: new Date(2026, 7, 3), maxDate: new Date(2026, 7, 14), selectionMode: "week", text: "10.08.2026" },
		{ name: "месяц после max", value: new Date(2026, 3, 1), maxDate: new Date(2026, 4, 31), selectionMode: "month", text: "06.2026" },
		{
			name: "последний день года вне max",
			value: new Date(2026, 0, 1),
			maxDate: new Date(2027, 11, 30),
			selectionMode: "year",
			text: "2027"
		}
	] satisfies readonly BoundedTextCase[])("после blur восстанавливает controlled value: $name", async (testCase) => {
		const onChange = vi.fn();
		await renderNode(
			<SingleDateInput
				value={testCase.value}
				minDate={testCase.minDate}
				maxDate={testCase.maxDate}
				selectionMode={testCase.selectionMode}
				label="Дата"
				onChange={onChange}
				weekEndDay="saturday"
			/>
		);
		const before = container?.querySelector<HTMLInputElement>("input")?.value;
		const input = await blurText(testCase.text);

		expect(onChange).not.toHaveBeenCalled();
		expect(input.value).toBe(before);
	});

	it.each([3, 5])("принимает включительную границу дня %i и сохраняет ровно один callback", async (day) => {
		const onChange = vi.fn();
		await renderNode(
			<SingleDateInput
				value={new Date(2026, 2, 4)}
				minDate={new Date(2026, 2, 3)}
				maxDate={new Date(2026, 2, 5)}
				onChange={onChange}
			/>
		);
		await blurText(`0${day}.03.2026`);
		expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, day));
	});

	it("принимает полную неделю до включённой субботы", async () => {
		const onChange = vi.fn();
		await renderNode(
			<SingleDateInput
				value={new Date(2026, 7, 3)}
				minDate={new Date(2026, 7, 3)}
				maxDate={new Date(2026, 7, 15)}
				selectionMode="week"
				weekEndDay="saturday"
				onChange={onChange}
			/>
		);
		const input = await blurText("15.08.2026");
		expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 7, 10));
		expect(input.value).toBe("10.08.2026 - 15.08.2026");
	});

	it("не меняет нормализацию воскресенья и текст без ограничений", async () => {
		const onChange = vi.fn();
		await renderNode(<SingleDateInput value={new Date(2026, 7, 3)} selectionMode="week" weekEndDay="saturday" onChange={onChange} />);
		const input = await blurText("02.08.2026");
		expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 6, 27));
		expect(input.value).toBe("27.07.2026 - 01.08.2026");
	});

	it("передаёт popup-семантику кнопке и связывает её с календарным диалогом", async () => {
		await renderNode(<SingleDateInput label="Дата" value={new Date(2026, 2, 3)} onChange={() => {}} />);

		const trigger = container?.querySelector('button[aria-label="Открыть календарь"]') as HTMLButtonElement;
		expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(trigger.parentElement?.hasAttribute("aria-expanded")).toBe(false);

		await act(async () => trigger.click());

		const dialog = document.querySelector('[role="dialog"][aria-label="Выбор даты"]');
		expect(dialog?.id).toBe(trigger.getAttribute("aria-controls"));
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(document.querySelector('button[aria-label="Предыдущий месяц"]')).not.toBeNull();
		expect(document.querySelector('button[aria-label="Следующий месяц"]')).not.toBeNull();
	});

	it("выводит новое controlled value без синхронизирующего effect", async () => {
		await renderNode(<ExternallyControlledSingleDateInput />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;
		expect(input.value).toBe("03.03.2026");

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть календарь"]') as HTMLButtonElement).click();
		});
		expect(document.querySelector('[data-action="calendar-switch-view"]')?.textContent).toContain("март");

		await act(async () => {
			Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? [])
				.find((button) => button.textContent === "Внешнее значение")
				?.click();
		});

		expect(input.value).toBe("04.04.2027");
		expect(document.querySelector('[data-action="calendar-switch-view"]')?.textContent).toContain("апрель");
	});

	it("не вызывает onChange при первом blur без изменения значения", async () => {
		const handleCommit = vi.fn();
		await renderNode(<ControlledSingleDateInput onCommit={handleCommit} />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			input.blur();
		});

		expect(handleCommit).not.toHaveBeenCalled();
	});

	it("вызывает onChange при blur после ручного изменения даты", async () => {
		const handleCommit = vi.fn();
		await renderNode(<ControlledSingleDateInput onCommit={handleCommit} />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			setNativeInputValue(input, "04.03.2026");
			input.blur();
		});

		expect(handleCommit).toHaveBeenCalledTimes(1);
		expect(handleCommit).toHaveBeenCalledWith(new Date(2026, 2, 4, 0, 0, 0));
	});

	it("парсит ручной ввод через day+month пресет", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));

		const handleCommit = vi.fn();
		await renderNode(<ControlledSingleDateInput datePreset="month-long" onCommit={handleCommit} />);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;

		await act(async () => {
			input.focus();
			setNativeInputValue(input, "25 июня");
			input.blur();
		});

		expect(handleCommit).toHaveBeenCalledTimes(1);
		expect(handleCommit).toHaveBeenCalledWith(new Date(2026, 5, 25, 0, 0, 0));
	});
});

describe("RangeDateInput", () => {
	it.each(["02.03.2026 - 05.03.2026", "04.03.2026 - 11.03.2026"])(
		"проверяет каждый текстовый конец и восстанавливает весь диапазон %s",
		async (text) => {
			const onChange = vi.fn();
			await renderNode(
				<RangeDateInput
					value={[new Date(2026, 2, 4), new Date(2026, 2, 5)]}
					minDate={new Date(2026, 2, 3)}
					maxDate={new Date(2026, 2, 10)}
					onChange={onChange}
				/>
			);
			const input = await blurText(text);
			expect(onChange).not.toHaveBeenCalled();
			expect(input.value).toBe("04.03.2026 - 05.03.2026");
		}
	);

	it("проверяет полную последнюю неделю диапазона, а не только её понедельник", async () => {
		const onChange = vi.fn();
		await renderNode(
			<RangeDateInput
				value={[new Date(2026, 7, 3), new Date(2026, 7, 8)]}
				maxDate={new Date(2026, 7, 21)}
				selectionMode="week"
				weekEndDay="saturday"
				onChange={onChange}
			/>
		);
		const input = await blurText("10.08.2026 - 17.08.2026");
		expect(onChange).not.toHaveBeenCalled();
		expect(input.value).toBe("03.08.2026 - 08.08.2026");
	});

	it("принимает включённую конечную дату и сохраняет незавершённый диапазон", async () => {
		const onChange = vi.fn();
		await renderNode(
			<RangeDateInput
				value={[new Date(2026, 2, 4), new Date(2026, 2, 5)]}
				minDate={new Date(2026, 2, 3)}
				maxDate={new Date(2026, 2, 10)}
				onChange={onChange}
			/>
		);
		await blurText("04.03.2026 - 10.03.2026");
		expect(onChange).toHaveBeenLastCalledWith([new Date(2026, 2, 4), new Date(2026, 2, 10, 23, 59, 59)]);
		await blurText("04.03.2026");
		expect(onChange).toHaveBeenLastCalledWith([new Date(2026, 2, 4), null]);
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("даёт календарному диалогу имя сценария выбора диапазона", async () => {
		await renderNode(<RangeDateInput label="Период" value={[null, null]} onChange={() => {}} />);

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть календарь"]') as HTMLButtonElement).click();
		});

		expect(document.querySelector('[role="dialog"][aria-label="Выбор диапазона дат"]')).not.toBeNull();
	});

	it("сохраняет порядок runtime-режимов и применяет отдельный формат каждого режима", async () => {
		await renderNode(
			<RangeDateInput
				label="Период"
				value={[new Date(2026, 2, 3), new Date(2026, 4, 5)]}
				onChange={() => {}}
				allowSelectionModeChange
				selectionModeOptions={["year", "month"]}
				selectionModeDatePresets={{
					year: "date",
					month: "month-year-long"
				}}
			/>
		);

		const input = container?.querySelector("input[type='text']") as HTMLInputElement;
		expect(input.value).toBe("2026 - 2026");

		await act(async () => {
			(container?.querySelector('button[aria-label="Открыть календарь"]') as HTMLButtonElement).click();
		});

		const modeOptions = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
		expect(modeOptions.map((option) => option.textContent?.trim())).toEqual(["Год", "Месяц"]);
		expect(modeOptions[0]?.getAttribute("aria-checked")).toBe("true");

		await act(async () => {
			modeOptions[1]?.click();
		});

		expect(input.value).toBe("март 2026 - май 2026");
	});
});
