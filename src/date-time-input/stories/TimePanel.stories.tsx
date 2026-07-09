import { useState } from "react";

import { TimePanel } from "../ui/TimePanel";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Internal/DateTime/TimePanel",
	component: TimePanel,
	args: {
		value: new Date(2026, 2, 10, 12, 30, 0, 0),
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "centered"
	}
} satisfies Meta<typeof TimePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Демонстрирует базовую wheel-панель времени.
 */
export const Default: Story = {
	render: (args) => {
		const [value, setValue] = useState<Date>(args.value);

		return (
			<div style={{ width: 320, minHeight: 280 }}>
				<TimePanel
					{...args}
					value={value}
					onChange={(hours, minutes) => {
						setValue(new Date(value.getFullYear(), value.getMonth(), value.getDate(), hours, minutes, 0, 0));
					}}
				/>
			</div>
		);
	}
};

/**
 * Показывает ограничение диапазона на том же календарном дне.
 */
export const WithLimits: Story = {
	render: (args) => {
		const [value, setValue] = useState<Date>(new Date(2026, 2, 10, 9, 30, 0, 0));

		return (
			<div style={{ width: 320, minHeight: 280 }}>
				<TimePanel
					{...args}
					value={value}
					minDate={new Date(2026, 2, 10, 9, 15, 0, 0)}
					maxDate={new Date(2026, 2, 10, 18, 30, 0, 0)}
					onChange={(hours, minutes) => {
						setValue(new Date(value.getFullYear(), value.getMonth(), value.getDate(), hours, minutes, 0, 0));
					}}
				/>
			</div>
		);
	}
};
