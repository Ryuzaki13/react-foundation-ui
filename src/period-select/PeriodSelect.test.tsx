// @vitest-environment jsdom

import { act, StrictMode, type ReactNode, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PeriodSelect } from "./PeriodSelect";

import type { PeriodSelectOption, PeriodSelectPresetId } from "./lib";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const LONG_DATE_RANGE = [new Date(2026, 2, 1), new Date(2026, 2, 10)] as const;
const SHORT_DATE_RANGE = [new Date(2026, 2, 1), new Date(2026, 2, 1)] as const;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderNode(node: ReactNode) {
	if (!container) {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	}

	await act(async () => {
		root?.render(node);
	});
}

function ControlledPeriodSelect({
	initialValue = "day",
	presetIds,
	dateRange,
	onChange
}: {
	initialValue?: PeriodSelectPresetId;
	presetIds: readonly PeriodSelectPresetId[];
	dateRange: readonly [Date, Date];
	onChange: (value: PeriodSelectOption["id"] | undefined) => void;
}) {
	const [value, setValue] = useState<PeriodSelectOption["id"] | undefined>(initialValue);

	return (
		<PeriodSelect
			value={value}
			onChange={(nextValue) => {
				setValue(nextValue);
				onChange(nextValue);
			}}
			presetIds={presetIds}
			dateRange={dateRange}
			maxDayRangeDays={1}
			maxWeekRangeWeeks={1}
		/>
	);
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
});

describe("PeriodSelect", () => {
	it("однократно синхронизирует исключенное текущее значение в StrictMode", async () => {
		const onChange = vi.fn<(value: PeriodSelectOption["id"] | undefined) => void>();

		await renderNode(
			<StrictMode>
				<ControlledPeriodSelect presetIds={["month", "year"]} dateRange={SHORT_DATE_RANGE} onChange={onChange} />
			</StrictMode>
		);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith("month");
		expect(container?.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe("по месяцам");
	});

	it("временно скрывает заблокированное значение без очистки controlled-state и восстанавливает его после смены диапазона", async () => {
		const onChange = vi.fn<(value: PeriodSelectOption["id"] | undefined) => void>();

		await renderNode(
			<StrictMode>
				<ControlledPeriodSelect presetIds={["day", "week"]} dateRange={LONG_DATE_RANGE} onChange={onChange} />
			</StrictMode>
		);

		expect(onChange).not.toHaveBeenCalled();
		expect(container?.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe("");

		await renderNode(
			<StrictMode>
				<ControlledPeriodSelect presetIds={["day", "week"]} dateRange={SHORT_DATE_RANGE} onChange={onChange} />
			</StrictMode>
		);

		expect(onChange).not.toHaveBeenCalled();
		expect(container?.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe("по дням");
	});

	it("использует кастомные options вместо presetIds", async () => {
		const onChange = vi.fn<(value: PeriodSelectOption["id"] | undefined) => void>();
		const options = [{ id: "quarter", label: "по кварталам" }] satisfies readonly PeriodSelectOption[];

		await renderNode(<PeriodSelect value="quarter" onChange={onChange} options={options} presetIds={["month"]} />);

		expect(onChange).not.toHaveBeenCalled();
		expect(container?.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe("по кварталам");
	});
});
