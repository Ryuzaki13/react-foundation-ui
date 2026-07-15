import { countCalendarDaysInDateRange, isDateRangeTuple, type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { RangeDateInput } from "../../date-input";
import { GridContainer } from "../../grid";
import { Text } from "../../text";
import { DEFAULT_PERIOD_SELECT_PRESET_IDS, PeriodSelect, type PeriodSelectProps } from "../index";

import type { Meta, StoryObj } from "@storybook/react-vite";

const defaultDateRange = [new Date(2026, 2, 1, 0, 0, 0), new Date(2026, 2, 14, 23, 59, 59)] as const satisfies NullableDateRange;
const longDateRange = [new Date(2026, 0, 1, 0, 0, 0), new Date(2026, 4, 20, 23, 59, 59)] as const satisfies NullableDateRange;

const meta = {
	title: "Shared/UI/PeriodSelect",
	component: PeriodSelect,
	args: {
		label: "Период детализации",
		description: "Выберите уровень группировки дат.",
		placeholder: "Выберите период",
		value: "day",
		onChange: fn<NonNullable<PeriodSelectProps["onChange"]>>(),
		presetIds: DEFAULT_PERIOD_SELECT_PRESET_IDS,
		dateRange: defaultDateRange,
		maxDayRangeDays: 31,
		maxWeekRangeWeeks: 26,
		disabled: false,
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		docs: {
			description: {
				component:
					"Select периода детализации дат. Компонент работает с id периода и может блокировать слишком детальные варианты по переданному диапазону дат."
			}
		}
	},
	argTypes: {
		label: {
			description: "Заголовок поля.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст, когда период не выбран.",
			control: "text"
		},
		value: {
			description: "Текущий id периода.",
			control: "select",
			options: DEFAULT_PERIOD_SELECT_PRESET_IDS
		},
		onChange: {
			description: "Вызывается с id выбранного периода.",
			control: false
		},
		options: {
			description: "Кастомный список периодов по контракту `PeriodSelectOption`; имеет приоритет над `presetIds`.",
			control: false
		},
		presetIds: {
			description: "Разрешенные встроенные периоды. Порядок отображения остается `day → week → month → year`.",
			control: "check",
			options: DEFAULT_PERIOD_SELECT_PRESET_IDS
		},
		dateRange: {
			description: "Диапазон дат, по которому вычисляются заблокированные периоды.",
			control: false
		},
		maxDayRangeDays: {
			description: "Максимальное количество дней, при котором доступен период `day`.",
			control: {
				type: "number",
				min: 1,
				step: 1
			}
		},
		maxWeekRangeWeeks: {
			description: "Максимальное количество недель, при котором доступен период `week`.",
			control: {
				type: "number",
				min: 1,
				step: 1
			}
		},
		disabled: {
			description: "Блокирует взаимодействие с полем.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<PeriodSelectProps>;

export default meta;
type Story = StoryObj<typeof meta>;

function getRangeInputValue(dateRange: PeriodSelectProps["dateRange"]): NullableDateRange | null {
	return dateRange !== undefined && isDateRangeTuple(dateRange) ? dateRange : null;
}

function PeriodSelectStoryCanvas(args: PeriodSelectProps) {
	const [, updateArgs] = useArgs<PeriodSelectProps>();
	const rangeValue = getRangeInputValue(args.dateRange);
	const rangeDays = countCalendarDaysInDateRange(args.dateRange ?? null);

	return (
		<GridContainer gap="md">
			<PeriodSelect
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>

			<RangeDateInput
				label="Связанный диапазон дат"
				placeholder="дд.мм.гггг - дд.мм.гггг"
				value={rangeValue}
				onChange={(dateRange) => updateArgs({ dateRange: dateRange ?? undefined })}
			/>

			<Text as="p" color="secondary" aria-live="polite">
				Выбрано: <Text as="code">{args.value ?? "не выбрано"}</Text>. Дней в диапазоне:{" "}
				<Text as="code">{rangeDays ?? "не задано"}</Text>.
			</Text>
		</GridContainer>
	);
}

/**
 * Контролируемый сценарий синхронизирует `value` и `dateRange` через Storybook args.
 */
export const Controlled: Story = {
	name: "Контролируемый выбор",
	render: function Render(args) {
		return <PeriodSelectStoryCanvas {...args} />;
	}
};

/**
 * Длинный диапазон блокирует `day` и `week`, поэтому контрол переключает значение на ближайший доступный период.
 */
export const AutoSwitchByRange: Story = {
	name: "Автопереключение по диапазону",
	args: {
		value: "day",
		dateRange: longDateRange,
		maxDayRangeDays: 31,
		maxWeekRangeWeeks: 8
	},
	render: function Render(args) {
		return <PeriodSelectStoryCanvas {...args} />;
	}
};

/**
 * Allow-list ограничивает встроенный каталог двумя крупными уровнями детализации.
 */
export const MonthAndYear: Story = {
	name: "Только месяцы и годы",
	args: {
		value: "month",
		presetIds: ["month", "year"]
	},
	render: function Render(args) {
		return <PeriodSelectStoryCanvas {...args} />;
	}
};

/**
 * При длинном диапазоне все разрешенные варианты временно недоступны; внешний
 * controlled-id сохраняется, и после сокращения диапазона отображение восстанавливается.
 */
export const AllAllowedOptionsDisabled: Story = {
	name: "Все разрешенные варианты недоступны",
	args: {
		value: "day",
		presetIds: ["day", "week"],
		dateRange: longDateRange,
		maxDayRangeDays: 31,
		maxWeekRangeWeeks: 8
	},
	render: function Render(args) {
		return <PeriodSelectStoryCanvas {...args} />;
	}
};

export const Disabled: Story = {
	name: "Заблокированный контрол",
	args: {
		disabled: true,
		value: "week"
	}
};
