import { fn } from "storybook/test";

import { DATE_INPUT_SELECTION_MODES, DATE_INPUT_WEEK_END_DAYS } from "../../../date-input/lib";
import { DEFAULT_DATE_RANGE_PRESET_IDS } from "../../../date-range-preset-select/lib/dateRangePresets";
import { createControlledStoryRender } from "../../../development/storybook/createControlledStoryRender";
import { FlexContainer } from "../../../flex";
import { Text } from "../../../text";
import { PresetRangeDateInput, type PresetRangeDateInputProps } from "../PresetRangeDateInput";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/PresetRangeDateInput",
	component: PresetRangeDateInput,
	args: {
		label: "Диапазон дат",
		placeholder: "дд.мм.гггг - дд.мм.гггг",
		value: [new Date(2026, 2, 10, 0, 0, 0), new Date(2026, 2, 10, 23, 59, 59)],
		onChange: fn<NonNullable<PresetRangeDateInputProps["onChange"]>>(),
		presetId: "today",
		onPresetIdChange: fn<NonNullable<PresetRangeDateInputProps["onPresetIdChange"]>>(),
		referenceDate: new Date(2026, 2, 10, 12, 0, 0),
		presetLabel: "Быстрый диапазон",
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		presetId: {
			description: "Контролируемый ID выбранного быстрого пресета. `null` снимает внешний выбор.",
			control: "select",
			options: [...DEFAULT_DATE_RANGE_PRESET_IDS, null]
		},
		onPresetIdChange: {
			description: "Вызывается, когда выбор пресета меняется из-за preset или ручного диапазона.",
			control: false
		},
		referenceDate: {
			description: "Опорная дата для вычисления встроенных быстрых диапазонов.",
			control: "date"
		},
		presetIds: {
			description: "Разрешённые встроенные ID пресетов, если не передан `presetOptions`.",
			control: "check",
			options: DEFAULT_DATE_RANGE_PRESET_IDS
		},
		presetOptions: {
			description: "Кастомный каталог быстрых диапазонов с функциями вычисления.",
			control: false
		},
		presetLabel: {
			description: "Заголовок поля быстрого выбора.",
			control: "text"
		},
		presetDescription: {
			description: "Описание под полем быстрого выбора.",
			control: "text"
		},
		presetPlaceholder: {
			description: "Текст до выбора быстрого диапазона.",
			control: "text"
		},
		presetDisabled: {
			description: "Блокирует только выбор быстрого пресета.",
			control: "boolean"
		},
		label: {
			description: "Заголовок ручного поля диапазона.",
			control: "text"
		},
		description: {
			description: "Описание ручного поля диапазона.",
			control: "text"
		},
		placeholder: {
			description: "Текст до выбора ручного диапазона.",
			control: "text"
		},
		value: {
			description: "Текущий ручной диапазон дат.",
			control: false
		},
		onChange: {
			description: "Вызывается при изменении ручного диапазона или выборе пресета.",
			control: false
		},
		error: {
			description: "Текст внешней ошибки ручного поля.",
			control: "text"
		},
		onClearError: {
			description: "Сбрасывает внешнюю ошибку после ввода или выбора.",
			control: false
		},
		minDate: {
			description: "Минимально доступная дата ручного диапазона.",
			control: "date"
		},
		maxDate: {
			description: "Максимально доступная дата ручного диапазона.",
			control: "date"
		},
		datePreset: {
			description: "Пресет форматирования выбранного ручного диапазона.",
			control: "text"
		},
		datePickerLevel: {
			description: "Минимальный уровень навигации календаря ручного поля.",
			control: "select",
			options: ["day", "month", "year"]
		},
		selectionMode: {
			description: "Размер периода, который выбирает ручное поле.",
			control: "select",
			options: DATE_INPUT_SELECTION_MODES
		},
		weekEndDay: {
			description: "Последний включённый день недели в режиме week.",
			control: "select",
			options: DATE_INPUT_WEEK_END_DAYS
		},
		allowSelectionModeChange: {
			description: "Показывает runtime-переключатель размера периода.",
			control: "boolean"
		},
		selectionModeOptions: {
			description: "Ограничивает доступные режимы в runtime-переключателе.",
			control: "check",
			options: DATE_INPUT_SELECTION_MODES
		},
		onSelectionModeChange: {
			description: "Вызывается при runtime-смене размера периода.",
			control: false
		},
		disabled: {
			description: "Блокирует ручное поле и, если `presetDisabled` не задан, быстрый выбор.",
			control: "boolean"
		},
		size: {
			description: "Размер обоих полей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof PresetRangeDateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderPresetRangeDateInputStory = createControlledStoryRender<PresetRangeDateInputProps>((args, updateArgs) => (
	<>
		<FlexContainer gap="sm" align="end">
			<PresetRangeDateInput
				{...args}
				value={args.value ?? null}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onPresetIdChange={(presetId) => {
					args.onPresetIdChange?.(presetId);
					updateArgs({ presetId });
				}}
				onSelectionModeChange={(selectionMode) => {
					args.onSelectionModeChange?.(selectionMode);
					updateArgs({ selectionMode });
				}}
				onClearError={() => {
					args.onClearError?.();
					updateArgs({ error: undefined });
				}}
			/>
		</FlexContainer>

		<Text as="p" className="marginBlockSm">
			Активный presetId: <Text as="code">{args.presetId ?? "null"}</Text>
		</Text>
	</>
));

/**
 * Демонстрирует совместную работу пресета и ручного диапазона.
 */
export const Default: Story = {
	render: renderPresetRangeDateInputStory
};
