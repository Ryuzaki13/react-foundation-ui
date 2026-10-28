import { useArgs } from "storybook/preview-api";

import { DATE_INPUT_SELECTION_MODES, DATE_INPUT_WEEK_END_DAYS, type DateInputSelectionMode } from "../lib";
import { RangeDateInput, SingleDateInput, type DateRangeInputProps, type DateSingleInputProps } from "../ui";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/DateInput",
	component: SingleDateInput,
	args: {
		value: null,
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок поля даты.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Плейсхолдер в текстовом поле даты.",
			control: "text"
		},
		value: {
			description: "Текущее значение даты (`Date | null`).",
			control: false
		},
		onChange: {
			description: "Вызывается при выборе даты или диапазона.",
			control: false
		},
		clearable: {
			description: "Добавляет встроенную очистку в null; пустой ручной ввод применяется по Enter или blur.",
			control: "boolean"
		},
		minDate: {
			description: "Включительная нижняя граница полного периода при выборе в календаре и вводе текстом.",
			control: "date"
		},
		maxDate: {
			description: "Включительная верхняя граница полного периода при выборе в календаре и вводе текстом.",
			control: "date"
		},
		datePreset: {
			description: "Имя пресета форматирования выбранной даты, например date-long, month-long или month-short.",
			control: "text"
		},
		datePickerLevel: {
			description: "Минимальный уровень календарной навигации. Не определяет размер выбранного периода.",
			control: "select",
			options: ["day", "month", "year"]
		},
		selectionMode: {
			description: "Размер выбранного периода.",
			control: "select",
			options: DATE_INPUT_SELECTION_MODES
		},
		weekEndDay: {
			description: "Последний включённый день недели для режима week.",
			control: "select",
			options: DATE_INPUT_WEEK_END_DAYS
		},
		allowSelectionModeChange: {
			description: "Показывает переключатель режима выбора под календарём.",
			control: "boolean"
		},
		selectionModeOptions: {
			description: "Ограничивает режимы и задаёт их порядок в runtime-переключателе.",
			control: "check",
			options: DATE_INPUT_SELECTION_MODES
		},
		selectionModeDatePresets: {
			description: "Задаёт имя datePreset отдельно для каждого runtime-режима выбора.",
			control: "object"
		},
		onSelectionModeChange: {
			description: "Вызывается при runtime-смене режима выбора.",
			control: false
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Сброс внешней ошибки при вводе.",
			control: false
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		disabled: {
			description: "Блокирует ввод и открытие календаря.",
			control: "boolean"
		}
	}
} satisfies Meta<typeof SingleDateInput>;

export default meta;
type SingleDateInputStoryArgs = Omit<DateSingleInputProps, "selectsRange">;
type RangeDateInputStoryArgs = Omit<DateRangeInputProps, "selectsRange">;
type SingleStory = StoryObj<SingleDateInputStoryArgs>;
type RangeStory = StoryObj<RangeDateInputStoryArgs>;

function handleSelectionModeArgChange<T extends { onSelectionModeChange?: (selectionMode: DateInputSelectionMode) => void }>(
	args: T,
	updateArgs: (args: Partial<T>) => void,
	selectionMode: DateInputSelectionMode
) {
	args.onSelectionModeChange?.(selectionMode);
	updateArgs({ selectionMode } as unknown as Partial<T>);
}

/**
 * Демонстрирует выбор одной даты без timezone-сдвига.
 */
export const Single: SingleStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<SingleDateInputStoryArgs>();

		return (
			<SingleDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		label: "Одиночная дата",
		placeholder: "дд.мм.гггг",
		value: new Date(2026, 2, 5, 0, 0, 0)
	}
};

/**
 * Демонстрирует выбор диапазона дат без timezone-сдвига.
 */
export const Range: RangeStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<RangeDateInputStoryArgs>();
		return (
			<RangeDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		label: "Диапазон дат",
		placeholder: "дд.мм.гггг - дд.мм.гггг",
		value: [new Date(2026, 2, 5, 0, 0, 0), new Date(2026, 2, 15, 23, 59, 59)]
	}
};

/** Очистка принадлежит самому полю и не требует внешней кнопки у потребителя. */
export const ClearableSingle: SingleStory = {
	...Single,
	args: { ...Single.args, clearable: true }
};

/** Диапазон может вернуться к состоянию без ограничения дат с сохранением режимов календаря. */
export const ClearableRange: RangeStory = {
	...Range,
	args: { ...Range.args, clearable: true, allowSelectionModeChange: true }
};

/**
 * Демонстрирует ограничения календаря.
 */
export const WithLimits: SingleStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<SingleDateInputStoryArgs>();
		return (
			<SingleDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		label: "Дата отчёта",
		description: "Доступен только март 2026.",
		value: new Date(2026, 2, 10, 0, 0, 0),
		minDate: new Date(2026, 2, 1, 0, 0, 0),
		maxDate: new Date(2026, 2, 31, 23, 59, 59)
	}
};

/**
 * Демонстрирует выбор недели строкой календаря.
 */
export const WeekSelection: RangeStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<RangeDateInputStoryArgs>();
		return (
			<RangeDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		label: "Недели",
		placeholder: "дд.мм.гггг - дд.мм.гггг",
		value: [new Date(2026, 2, 2, 0, 0, 0), new Date(2026, 2, 13, 23, 59, 59)],
		selectionMode: "week",
		weekEndDay: "friday"
	}
};

/**
 * Демонстрирует связь формата отображения с режимом выбора периода.
 */
export const PickerLevels: SingleStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<SingleDateInputStoryArgs>();

		return (
			<SingleDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		label: "Месяц",
		placeholder: "месяц год",
		value: new Date(2026, 2, 1, 0, 0, 0),
		datePreset: "date-long",
		selectionMode: "month"
	}
};

/**
 * Демонстрирует runtime-переключение режима выбора под календарём.
 */
export const RuntimeSelectionMode: RangeStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<RangeDateInputStoryArgs>();

		return (
			<RangeDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		label: "Период",
		placeholder: "дд.мм.гггг - дд.мм.гггг",
		value: [new Date(2026, 2, 5, 0, 0, 0), new Date(2026, 2, 15, 23, 59, 59)],
		selectionMode: "day",
		allowSelectionModeChange: true,
		selectionModeDatePresets: {
			day: "date",
			week: "date-long",
			month: "month-year-long",
			year: "date-long"
		}
	}
};

/**
 * Демонстрирует разные размеры.
 */
export const Sizes: RangeStory = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<RangeDateInputStoryArgs>();
		return (
			<RangeDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onSelectionModeChange={(selectionMode) => handleSelectionModeArgChange(args, updateArgs, selectionMode)}
			/>
		);
	},
	args: {
		size: "lg",
		label: "Диапазон дат",
		placeholder: "дд.мм.гггг - дд.мм.гггг",
		value: [new Date(2026, 2, 5, 0, 0, 0), new Date(2026, 2, 15, 23, 59, 59)]
	}
};
