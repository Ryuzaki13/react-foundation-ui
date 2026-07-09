import { ReactNode, useState } from "react";

import { createFilterBetween } from "@ryuzaki13/react-foundation-lib/odata-service";

import { SliderInput, SliderRangeInput, type SliderRangeValue } from "..";

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
	title: "Shared/UI/SliderInput",
	component: SliderInput,
	args: {
		value: 12,
		onChange: () => {},
		min: 0,
		max: 100,
		step: 0.5
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	}
} satisfies Meta<typeof SliderInput>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Basic: Story = {
	render: (args) => {
		const [value, setValue] = useState<number>(args.value);

		return (
			<SliderInput
				{...args}
				label="Порог"
				description="Ручной ввод и popover slider работают с одним значением."
				value={value}
				onChange={setValue}
			/>
		);
	}
};

export const MarksSnap: Story = {
	render: (args) => {
		const [value, setValue] = useState<number>(40);

		return <SliderInput {...args} label="Готовый пресет" marks={percentMarks} value={value} onChange={setValue} />;
	}
};

export const DecimalManualInput: Story = {
	render: (args) => {
		const [value, setValue] = useState<number>(17.5);

		return <SliderInput {...args} label="Десятичное значение" value={value} onChange={setValue} />;
	},
	args: {
		step: 0.5
	}
};

export const RangeInputPlain: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue>([20, 80]);

		return (
			<>
				<SliderRangeInput
					label="Процент выполнения"
					description="RangeInput без outputValue: наружу отдаётся координата `value`."
					min={0}
					max={100}
					marks={percentMarks}
					value={value}
					onChange={setValue}
				/>
				<RangePreview value={value} field="progress" unit="%" />
			</>
		);
	}
};

export const RangeInputOpenWithoutExplicitMiddleOutput: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue>([null, 12]);

		return (
			<>
				<SliderRangeInput
					label="Срок в месяцах"
					description="У крайних marks `outputValue:null`; у обычных marks outputValue не указан и берётся `value`."
					min={0}
					max={25}
					marks={openMonthMarks}
					marksPosition="index"
					value={value}
					onChange={setValue}
				/>
				<RangePreview value={value} field="months" unit=" мес." />
			</>
		);
	}
};

export const RangeInputMonthToDaysOutput: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue>([90, 360]);

		return (
			<>
				<SliderRangeInput
					label="Срок: месяцы на шкале, дни в фильтре"
					description="В поле и фильтре видны дни, а popover показывает месячные marks."
					min={1}
					max={24}
					marks={monthToDayMarks}
					marksPosition="index"
					value={value}
					onChange={setValue}
				/>
				<RangePreview value={value} field="days" unit=" дн." />
			</>
		);
	}
};

export const RangeInputOpenMonthToDaysOutput: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue>([null, 720]);

		return (
			<>
				<SliderRangeInput
					label="Срок: открытые границы и дни в фильтре"
					description="Крайние marks отдают null, обычные marks отдают дни через `outputValue`."
					min={0}
					max={25}
					marks={openMonthToDayMarks}
					marksPosition="index"
					value={value}
					onChange={setValue}
				/>
				<RangePreview value={value} field="days" unit=" дн." />
			</>
		);
	}
};

export const RangeInputReadonlyText: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue>([90, 180]);

		return (
			<>
				<SliderRangeInput
					label="Срок текстом"
					description="В поле выводится готовый текст по marks, а изменение через popover коммитится при закрытии."
					min={0}
					max={25}
					marks={openMonthToDayMarks}
					marksPosition="index"
					value={value}
					onChange={setValue}
					readonlyValueText
					placeholder="Любой срок"
				/>
				<RangePreview value={value} field="days" unit=" дн." />
			</>
		);
	}
};

export const Disabled: Story = {
	args: {
		label: "Недоступно",
		description: "Поле и popover отключены.",
		value: 20,
		disabled: true,
		marks: percentMarks
	}
};
