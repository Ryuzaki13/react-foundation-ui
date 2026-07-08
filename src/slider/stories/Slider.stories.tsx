import { ReactNode, useState } from "react";

import { Slider, SliderRange, type SliderProps, type SliderRangeValue } from "..";

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
	title: "Shared/UI/Slider",
	component: Slider,
	args: {
		value: 30,
		onChange: () => {},
		min: 0,
		max: 100,
		step: 5
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const SingleStep: Story = {
	render: (args) => {
		const sliderArgs = args as SliderProps;
		const [value, setValue] = useState<number | undefined>(args.value as number | undefined);

		return <Slider {...sliderArgs} label="Громкость" value={value} onChange={setValue} />;
	},
	args: {
		description: "Компактный single-value слайдер со step=5.",
		value: 35,
		step: 5
	}
};

export const SingleWithMarks: Story = {
	render: (args) => {
		const sliderArgs = args as SliderProps;
		const [value, setValue] = useState<number | undefined>(50);

		return <Slider {...sliderArgs} label="Процент выполнения" value={value} onChange={setValue} />;
	},
	args: {
		description: "Marks активны, кликабельны и показывают подписи через tooltip.",
		value: 50,
		marks: percentMarks
	}
};

export const MonthsIndexMarks: Story = {
	render: (args) => {
		const sliderArgs = args as SliderProps;
		const [value, setValue] = useState<number | undefined>(6);

		return <Slider {...sliderArgs} label="Срок" value={value} onChange={setValue} />;
	},
	args: {
		min: 1,
		max: 24,
		value: 6,
		marks: monthMarks,
		marksPosition: "index",
		description: "Неравномерные значения месяцев расположены с равным визуальным шагом."
	}
};

export const RangePlain: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue | undefined>([25, 75]);

		return (
			<>
				<SliderRange
					label="Процент выполнения"
					description="Обычный range: `value` mark является и координатой шкалы, и значением фильтра."
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

export const RangeOpenWithoutExplicitMiddleOutput: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue | undefined>([null, 12]);

		return (
			<>
				<SliderRange
					label="Срок в месяцах"
					description="Открытые границы задаются только крайними `outputValue:null`; у обычных marks outputValue не указан и берётся `value`."
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

export const RangeMonthToDaysOutput: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue | undefined>([90, 360]);

		return (
			<>
				<SliderRange
					label="Срок: месяцы на шкале, дни в фильтре"
					description="`value` хранит координату/месяцы, `outputValue` отдаёт наружу дни."
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

export const RangeOpenMonthToDaysOutput: Story = {
	render: () => {
		const [value, setValue] = useState<SliderRangeValue | undefined>([null, 720]);

		return (
			<>
				<SliderRange
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

export const Disabled: Story = {
	args: {
		label: "Недоступно",
		description: "Состояние без интеракций.",
		value: 40,
		disabled: true,
		marks: percentMarks
	}
};
