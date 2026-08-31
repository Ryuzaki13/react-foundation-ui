import type { ReactNode } from "react";

import { createFilterBetween } from "@ryuzaki13/react-foundation-lib/odata-service";
import { fn } from "storybook/test";

import { SliderInput, SliderRangeInput, type SliderInputProps, type SliderRangeInputProps, type SliderRangeValue } from "..";
import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";

import type { Meta, StoryObj } from "@storybook/react-vite";

const percentMarks = [
	{ value: 0, label: "0" },
	{ value: 20, label: "20" },
	{ value: 40, label: "40" },
	{ value: 60, label: "60" },
	{ value: 80, label: "80" },
	{ value: 100, label: "100" }
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
	{ value: 0, label: "-", outputValue: null },
	{ value: 1, label: "1м.", outputValue: 30 },
	{ value: 3, label: "3м.", outputValue: 90 },
	{ value: 6, label: "6м.", outputValue: 180 },
	{ value: 12, label: "1г.", outputValue: 360 },
	{ value: 18, label: "1.5г.", outputValue: 540 },
	{ value: 24, label: "2г.", outputValue: 720 },
	{ value: 25, label: "-", outputValue: null }
] as const;

const meta = {
	title: "UI/SliderInput",
	component: SliderInput,
	args: {
		label: "Порог",
		value: 12,
		onChange: fn<SliderInputProps["onChange"]>(),
		min: 0,
		max: 100,
		step: 0.5
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Подпись поля над числовым вводом.",
			control: "text"
		},
		description: {
			description: "Пояснение под подписью поля.",
			control: "text"
		},
		placeholder: {
			description: "Текст пустого поля или readonly-диапазона.",
			control: "text"
		},
		value: {
			description: "Текущее значение; в range-сценариях — пара бизнес-границ.",
			control: false
		},
		onChange: {
			description: "Вызывается после commit ручного ввода или закрытия popover.",
			control: false
		},
		min: {
			description: "Минимальная координата шкалы в popover.",
			control: "number"
		},
		max: {
			description: "Максимальная координата шкалы в popover.",
			control: "number"
		},
		step: {
			description: "Шаг ручного ввода и слайдера, если не заданы marks.",
			control: {
				type: "number",
				min: 0,
				step: 0.1
			}
		},
		marks: {
			description: "Дискретные точки popover-слайдера; range-marks могут возвращать outputValue.",
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
			description: "Размер подписи и поля.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		disabled: {
			description: "Блокирует ручной ввод и открытие popover.",
			control: "boolean"
		}
	}
} satisfies Meta<typeof SliderInput>;

export default meta;
type SingleStory = StoryObj<SliderInputProps>;
type RangeStory = StoryObj<SliderRangeInputProps>;

const renderSliderInputStory = createControlledStoryRender<SliderInputProps>((args, updateArgs) => (
	<SliderInput
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

function createRangeSliderInputStoryRender(field: string) {
	return createControlledStoryRender<SliderRangeInputProps>((args, updateArgs) => (
		<>
			<SliderRangeInput
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
			<RangePreview value={args.value} field={field} />
		</>
	));
}

function RangePreview({
	value,
	field,
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
						filter: createFilterBetween(field, value)
					},
					null,
					2
				)}
			</pre>
			{children}
		</div>
	);
}

export const Basic: SingleStory = {
	render: renderSliderInputStory,
	args: {
		label: "Порог",
		description: "Ручной ввод и popover slider работают с одним значением."
	}
};

export const MarksSnap: SingleStory = {
	render: renderSliderInputStory,
	args: {
		label: "Готовый пресет",
		value: 40,
		marks: percentMarks
	}
};

export const DecimalManualInput: SingleStory = {
	render: renderSliderInputStory,
	args: {
		label: "Десятичное значение",
		value: 17.5,
		step: 0.5
	}
};

export const RangeInputPlain: RangeStory = {
	render: createRangeSliderInputStoryRender("progress"),
	args: {
		label: "Процент выполнения",
		description: "RangeInput без outputValue: наружу отдаётся координата `value`.",
		min: 0,
		max: 100,
		marks: percentMarks,
		value: [20, 80]
	}
};

export const RangeInputOpenWithoutExplicitMiddleOutput: RangeStory = {
	render: createRangeSliderInputStoryRender("months"),
	args: {
		label: "Срок в месяцах",
		description: "У крайних marks `outputValue:null`; у обычных marks outputValue не указан и берётся `value`.",
		min: 0,
		max: 25,
		marks: openMonthMarks,
		marksPosition: "index",
		value: [null, 12]
	}
};

export const RangeInputMonthToDaysOutput: RangeStory = {
	render: createRangeSliderInputStoryRender("days"),
	args: {
		label: "Срок: месяцы на шкале, дни в фильтре",
		description: "В поле и фильтре видны дни, а popover показывает месячные marks.",
		min: 1,
		max: 24,
		marks: monthToDayMarks,
		marksPosition: "index",
		value: [90, 360]
	}
};

export const RangeInputOpenMonthToDaysOutput: RangeStory = {
	render: createRangeSliderInputStoryRender("days"),
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

export const RangeInputReadonlyText: RangeStory = {
	render: createRangeSliderInputStoryRender("days"),
	args: {
		label: "Срок текстом",
		description: "В поле выводится готовый текст по marks, а изменение через popover коммитится при закрытии.",
		min: 0,
		max: 25,
		marks: openMonthToDayMarks,
		marksPosition: "index",
		value: [90, 180],
		readonlyValueText: true,
		placeholder: "Любой срок"
	},
	argTypes: {
		readonlyValueText: {
			description: "Показывает собранный текст вместо ручных сегментов диапазона.",
			control: "boolean"
		}
	}
};

export const Disabled: SingleStory = {
	render: renderSliderInputStory,
	args: {
		label: "Недоступно",
		description: "Поле и popover отключены.",
		value: 20,
		disabled: true,
		marks: percentMarks
	}
};
