import { useState } from "react";

import { RangeDateInput } from "../../date-input";
import { GridContainer } from "../../grid";
import { DateRangePresetSelect } from "../DateRangePresetSelect";
import { DateRangePresetChangePayload } from "../lib/dateRangePresets";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/DateRangePresetSelect",
	component: DateRangePresetSelect,
	args: {
		value: "monthStartToToday",
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	}
} satisfies Meta<typeof DateRangePresetSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Демонстрирует связку выбора пресета и ручного диапазона дат.
 */
export const Default: Story = {
	render: () => {
		const [presetId, setPresetId] = useState<string | undefined>("monthStartToToday");
		const [range, setRange] = useState<DateRangePresetChangePayload["range"] | null>([
			new Date(2026, 2, 1, 0, 0, 0),
			new Date(2026, 2, 10, 23, 59, 59)
		]);

		return (
			<GridContainer gap="md">
				<DateRangePresetSelect
					label="Пресет диапазона"
					placeholder="Выберите пресет"
					value={presetId}
					onChange={setPresetId}
					onRangeChange={(payload) => setRange(payload?.range ?? null)}
					referenceDate={new Date(2026, 2, 10, 12, 0, 0)}
				/>

				<RangeDateInput
					label="Диапазон дат"
					placeholder="дд.мм.гггг - дд.мм.гггг"
					value={range}
					onChange={(nextRange) => setRange(nextRange)}
				/>
			</GridContainer>
		);
	}
};
