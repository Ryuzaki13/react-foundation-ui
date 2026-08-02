import { useArgs, useState as useStorybookState } from "storybook/preview-api";
import { fn } from "storybook/test";

import { RangeDateInput } from "../../date-input";
import { GridContainer } from "../../grid";
import { DateRangePresetSelect, type DateRangePresetSelectProps } from "../DateRangePresetSelect";
import {
	DEFAULT_DATE_RANGE_PRESET_OPTIONS,
	resolveDateRangePresetPayload,
	type DateRangePresetChangePayload
} from "../lib/dateRangePresets";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/DateRangePresetSelect",
	component: DateRangePresetSelect,
	args: {
		label: "Пресет диапазона",
		placeholder: "Выберите пресет",
		value: "monthStartToToday",
		onChange: fn<NonNullable<DateRangePresetSelectProps["onChange"]>>(),
		options: DEFAULT_DATE_RANGE_PRESET_OPTIONS,
		referenceDate: new Date(2026, 2, 10, 12, 0, 0),
		onRangeChange: fn<NonNullable<DateRangePresetSelectProps["onRangeChange"]>>(),
		disabled: false,
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок выбора пресета.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст, который показывается до выбора пресета.",
			control: "text"
		},
		value: {
			description: "ID активного пресета диапазона.",
			control: "select",
			options: DEFAULT_DATE_RANGE_PRESET_OPTIONS.map((option) => option.id)
		},
		onChange: {
			description: "Вызывается с ID выбранного пресета.",
			control: false
		},
		options: {
			description: "Кастомный каталог пресетов с функциями вычисления диапазона.",
			control: false
		},
		referenceDate: {
			description: "Опорная дата, относительно которой вычисляется диапазон пресета.",
			control: "date"
		},
		onRangeChange: {
			description: "Вызывается с вычисленным диапазоном активного пресета.",
			control: false
		},
		disabled: {
			description: "Блокирует выбор пресета.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof DateRangePresetSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Демонстрирует связку выбора пресета и ручного диапазона дат.
 */
export const Default: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<DateRangePresetSelectProps>();
		const [range, setRange] = useStorybookState<DateRangePresetChangePayload["range"] | null>(
			() => resolveDateRangePresetPayload(args.value, args.referenceDate, args.options)?.range ?? null
		);

		return (
			<GridContainer gap="md">
				<DateRangePresetSelect
					{...args}
					onChange={(value) => {
						args.onChange(value);
						updateArgs({ value });
					}}
					onRangeChange={(payload) => {
						args.onRangeChange?.(payload);
						setRange(payload?.range ?? null);
					}}
				/>

				<RangeDateInput label="Диапазон дат" placeholder="дд.мм.гггг - дд.мм.гггг" value={range} onChange={setRange} />
			</GridContainer>
		);
	}
};
