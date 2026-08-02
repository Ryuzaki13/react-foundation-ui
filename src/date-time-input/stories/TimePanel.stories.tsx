import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { TimePanel, type TimePanelProps } from "../ui/TimePanel";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Internal/DateTime/TimePanel",
	component: TimePanel,
	args: {
		value: new Date(2026, 2, 10, 12, 30, 0, 0),
		onChange: fn<TimePanelProps["onChange"]>(),
		disabled: false,
		mode: "date-time"
	},
	parameters: {
		atomicCanvas: true,
		layout: "centered"
	},
	argTypes: {
		value: {
			description: "Текущая дата, из которой панель берёт календарный день и время.",
			control: false
		},
		disabled: {
			description: "Блокирует оба wheel-picker-а.",
			control: "boolean"
		},
		minDate: {
			description: "Нижняя граница доступного времени для выбранного дня.",
			control: "date"
		},
		maxDate: {
			description: "Верхняя граница доступного времени для выбранного дня.",
			control: "date"
		},
		mode: {
			description: "Режим вычисления доступного времени.",
			control: "inline-radio",
			options: ["date-time", "time"]
		},
		onChange: {
			description: "Вызывается с выбранными часами и минутами.",
			control: false
		}
	}
} satisfies Meta<typeof TimePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function TimePanelStoryCanvas(args: TimePanelProps) {
	const [, updateArgs] = useArgs<TimePanelProps>();
	const value = args.value;

	return (
		<div style={{ width: 320, minHeight: 280 }}>
			<TimePanel
				{...args}
				value={value}
				onChange={(hours, minutes) => {
					args.onChange(hours, minutes);
					updateArgs({ value: new Date(value.getFullYear(), value.getMonth(), value.getDate(), hours, minutes, 0, 0) });
				}}
			/>
		</div>
	);
}

/**
 * Демонстрирует базовую wheel-панель времени.
 */
export const Default: Story = {
	render: function Render(args) {
		return <TimePanelStoryCanvas {...args} />;
	}
};

/**
 * Показывает ограничение диапазона на том же календарном дне.
 */
export const WithLimits: Story = {
	render: function Render(args) {
		return <TimePanelStoryCanvas {...args} />;
	},
	args: {
		value: new Date(2026, 2, 10, 9, 30, 0, 0),
		minDate: new Date(2026, 2, 10, 9, 15, 0, 0),
		maxDate: new Date(2026, 2, 10, 18, 30, 0, 0)
	}
};
