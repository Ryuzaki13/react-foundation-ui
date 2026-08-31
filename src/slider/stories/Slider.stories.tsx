import type { ReactNode } from "react";

import { fn } from "storybook/test";

import { Slider, SliderRange, type SliderProps, type SliderRangeProps, type SliderRangeValue } from "..";
import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";

import type { Meta, StoryObj } from "@storybook/react-vite";

const percentMarks = [
	{ value: 0, label: "0" },
	{ value: 25, label: "25" },
	{ value: 50, label: "50" },
	{ value: 75, label: "75" },
	{ value: 100, label: "100" }
] as const;

const monthMarks = [
	{ value: 1, label: "1 мес." },
	{ value: 3, label: "3 мес." },
	{ value: 6, label: "6 мес." },
	{ value: 9, label: "9 мес." },
	{ value: 12, label: "12 мес." },
	{ value: 18, label: "18 мес." },
	{ value: 24, label: "24 мес." }
] as const;

const openMonthMarks = [
	{ value: 0, label: "Без нижней границы", outputValue: null },
	{ value: 1, label: "1 мес." },
	{ value: 3, label: "3 мес." },
	{ value: 6, label: "6 мес." },
	{ value: 12, label: "12 мес." },
	{ value: 24, label: "24 мес." },
	{ value: 25, label: "Без верхней границы", outputValue: null }
] as const;

const monthToDayMarks = [
	{ value: 1, label: "1 мес.", outputValue: 30 },
	{ value: 3, label: "3 мес.", outputValue: 90 },
	{ value: 6, label: "6 мес.", outputValue: 180 },
	{ value: 12, label: "12 мес.", outputValue: 360 },
	{ value: 24, label: "24 мес.", outputValue: 720 }
] as const;

const openMonthToDayMarks = [
	{ value: 0, label: "Без нижней границы", outputValue: null },
	{ value: 1, label: "1 мес.", outputValue: 30 },
	{ value: 3, label: "3 мес.", outputValue: 90 },
	{ value: 6, label: "6 мес.", outputValue: 180 },
	{ value: 12, label: "12 мес.", outputValue: 360 },
	{ value: 24, label: "24 мес.", outputValue: 720 },
	{ value: 25, label: "Без верхней границы", outputValue: null }
] as const;

const meta = {
	title: "UI/Slider",
	component: Slider,
	args: {
		label: "Слайдер",
		value: 30,
		onChange: fn<SliderProps["onChange"]>(),
		min: 0,
		max: 100,
		step: 5
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Подпись поля над слайдером.",
			control: "text"
		},
		description: {
			description: "Пояснение под подписью поля.",
			control: "text"
		},
		value: {
			description: "Текущее выбранное значение; в range-сценариях — пара границ.",
			control: false
		},
		onChange: {
			description: "Вызывается после выбора значения или границ.",
			control: false
		},
		min: {
			description: "Минимальная координата шкалы.",
			control: "number"
		},
		max: {
			description: "Максимальная координата шкалы.",
			control: "number"
		},
		step: {
			description: "Шаг шкалы, когда не заданы допустимые marks.",
			control: {
				type: "number",
				min: 0,
				step: 0.1
			}
		},
		marks: {
			description: "Дискретные точки выбора; range-marks могут возвращать отдельный outputValue.",
			control: false
		},
		marksPosition: {
			description: "Располагает marks пропорционально значению или равномерно по индексу.",
			control: "inline-radio",
			options: ["value", "index"]
		},
		error: {
			description: "Текст внешней ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Вызывается после успешного изменения значения.",
			control: false
		},
		size: {
			description: "Размер подписи и обёртки поля.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		disabled: {
			description: "Блокирует pointer-, click- и keyboard-взаимодействие.",
			control: "boolean"
		}
	}
} satisfies Meta<typeof Slider>;

export default meta;
type SingleStory = StoryObj<SliderProps>;
type RangeStory = StoryObj<SliderRangeProps>;

const renderSliderStory = createControlledStoryRender<SliderProps>((args, updateArgs) => (
	<Slider
		{...args}
		onChange={(value) => {
			args.onChange(value);
			updateArgs({ value });
		}}
		onClearError={() => {
			args.onClearError?.();
			updateArgs({ error: undefined });
		}}
	/>
));

function createRangeSliderStoryRender(field: string, unit?: string) {
	return createControlledStoryRender<SliderRangeProps>((args, updateArgs) => (
		<>
			<SliderRange
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onClearError={() => {
					args.onClearError?.();
					updateArgs({ error: undefined });
				}}
			/>
			<RangePreview value={args.value} field={field} unit={unit} />
		</>
	));
}

function formatEndpoint(value: number | null, unit: string) {
	return value === null ? "null" : `${value}${unit}`;
}

function compileRangeFilter(value: SliderRangeValue | undefined, field: string, unit = "") {
	const [from, to] = value ?? [null, null];
	const clauses: string[] = [];

	if (from !== null) {
		clauses.push(`${field} >= ${from}${unit}`);
	}

	if (to !== null) {
		clauses.push(`${field} <= ${to}${unit}`);
	}

	return clauses.length > 0 ? clauses.join(" AND ") : "Фильтр не ограничивает значение";
}

function RangePreview({
	value,
	field,
	unit = "",
	children
}: {
	value: SliderRangeValue | undefined;
	field: string;
	unit?: string;
	children?: ReactNode;
}) {
	const [from, to] = value ?? [null, null];

	return (
		<div className="marginTopMd">
			<div className="textSm сontent2">Preview фильтра</div>
			<pre>
				{JSON.stringify(
					{
						value: [from, to],
						human: `${formatEndpoint(from, unit)} — ${formatEndpoint(to, unit)}`,
						filter: compileRangeFilter(value, field, unit)
					},
					null,
					2
				)}
			</pre>
			{children}
		</div>
	);
}

export const SingleStep: SingleStory = {
	render: renderSliderStory,
	args: {
		label: "Громкость",
		description: "Компактный single-value слайдер со step=5.",
		value: 35,
		step: 5
	}
};

export const SingleWithMarks: SingleStory = {
	render: renderSliderStory,
	args: {
		label: "Процент выполнения",
		description: "Marks активны, кликабельны и показывают подписи через tooltip.",
		value: 50,
		marks: percentMarks
	}
};

export const MonthsIndexMarks: SingleStory = {
	render: renderSliderStory,
	args: {
		label: "Срок",
		min: 1,
		max: 24,
		value: 6,
		marks: monthMarks,
		marksPosition: "index",
		description: "Неравномерные значения месяцев расположены с равным визуальным шагом."
	}
};

export const RangePlain: RangeStory = {
	render: createRangeSliderStoryRender("progress", "%"),
	args: {
		label: "Процент выполнения",
		description: "Обычный range: `value` mark является и координатой шкалы, и значением фильтра.",
		min: 0,
		max: 100,
		marks: percentMarks,
		value: [25, 75]
	}
};

export const RangeOpenWithoutExplicitMiddleOutput: RangeStory = {
	render: createRangeSliderStoryRender("months", " мес."),
	args: {
		label: "Срок в месяцах",
		description:
			"Открытые границы задаются только крайними `outputValue:null`; у обычных marks outputValue не указан и берётся `value`.",
		min: 0,
		max: 25,
		marks: openMonthMarks,
		marksPosition: "index",
		value: [null, 12]
	}
};

export const RangeMonthToDaysOutput: RangeStory = {
	render: createRangeSliderStoryRender("days", " дн."),
	args: {
		label: "Срок: месяцы на шкале, дни в фильтре",
		description: "`value` хранит координату/месяцы, `outputValue` отдаёт наружу дни.",
		min: 1,
		max: 24,
		marks: monthToDayMarks,
		marksPosition: "index",
		value: [90, 360]
	}
};

export const RangeOpenMonthToDaysOutput: RangeStory = {
	render: createRangeSliderStoryRender("days", " дн."),
	args: {
		label: "Срок: открытые границы и дни в фильтре",
		description: "Крайние marks отдают null, обычные marks отдают дни через `outputValue`.",
		min: 0,
		max: 25,
		marks: openMonthToDayMarks,
		marksPosition: "index",
		value: [null, 720]
	}
};

export const Disabled: SingleStory = {
	render: renderSliderStory,
	args: {
		label: "Недоступно",
		description: "Состояние без интеракций.",
		value: 40,
		disabled: true,
		marks: percentMarks
	}
};
