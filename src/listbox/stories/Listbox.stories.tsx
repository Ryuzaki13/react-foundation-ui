import { type ComponentProps, type ReactNode } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Listbox } from "../Listbox";

type StringOption = {
	id: string;
	label?: string;
	disabled?: boolean;
};

function StringListbox(props: {
	options: StringOption[];
	multiple?: boolean;
	value?: string | string[];
	defaultValue?: string | string[];
	disabled?: boolean;
	focusOnMount?: boolean;
	onChange?: (value: string | string[], option: StringOption) => void;
	renderItem?: (option: StringOption, selected: boolean, active: boolean) => ReactNode;
	getKey?: (option: StringOption, index: number) => string;
	className?: string;
}) {
	if (props.multiple) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return <Listbox<string> {...props} multiple />;
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return <Listbox<string> {...props} />;
}

const options: StringOption[] = [
	{ id: "low", label: "Низкий" },
	{ id: "medium", label: "Средний" },
	{ id: "high", label: "Высокий" },
	{ id: "critical", label: "Критический", disabled: true }
];

const meta = {
	title: "Shared/UI/Listbox",
	component: StringListbox,
	args: {
		options,
		multiple: false,
		value: "medium",
		onChange: fn<(value: string | string[], option: StringOption) => void>()
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		options: {
			description: "Массив доступных опций списка.",
			control: false
		},
		multiple: {
			description: "Режим множественного выбора.",
			control: "boolean"
		},
		value: {
			description: "Текущее выбранное значение (или массив значений).",
			control: false
		},
		defaultValue: {
			description: "Начальное значение для uncontrolled-режима.",
			control: false
		},
		disabled: {
			description: "Блокирует фокусировку, навигацию и изменение выбора.",
			control: "boolean"
		},
		onChange: {
			description: "Вызывается при выборе опции.",
			control: false
		},
		focusOnMount: {
			description: "Автофокус списка при монтировании.",
			control: "boolean"
		},
		renderItem: {
			description: "Кастомный рендер строки списка.",
			control: false
		},
		getKey: {
			description: "Функция генерации ключа для опции.",
			control: false
		}
	}
} satisfies Meta<typeof StringListbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSelect: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<ComponentProps<typeof StringListbox>>();
		const value = typeof args.value === "string" ? args.value : "medium";

		return (
			<div style={{ display: "grid", gap: 12, maxWidth: 280 }}>
				<StringListbox
					{...args}
					multiple={false}
					value={value}
					onChange={(next, option) => {
						if (typeof next !== "string") return;

						args.onChange?.(next, option);
						updateArgs({ value: next });
					}}
				/>
				<div>Выбрано: {value}</div>
			</div>
		);
	}
};

export const MultiSelect: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<ComponentProps<typeof StringListbox>>();
		const value = Array.isArray(args.value) ? args.value : ["low", "high"];

		return (
			<div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
				<StringListbox
					{...args}
					multiple
					value={value}
					onChange={(next, option) => {
						if (!Array.isArray(next)) return;

						args.onChange?.(next, option);
						updateArgs({ value: next });
					}}
				/>
				<div>Выбрано: {value.join(", ") || "пусто"}</div>
			</div>
		);
	},
	args: {
		multiple: true
	}
};

export const CustomRender: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<ComponentProps<typeof StringListbox>>();
		const value = typeof args.value === "string" ? args.value : "low";

		return (
			<StringListbox
				{...args}
				value={value}
				onChange={(next, option) => {
					if (typeof next !== "string") return;

					args.onChange?.(next, option);
					updateArgs({ value: next });
				}}
				renderItem={(option, selected, active) => (
					<div style={{ display: "flex", justifyContent: "space-between", width: "100%", opacity: option.disabled ? 0.5 : 1 }}>
						<span>{option.label}</span>
						<span>{selected ? "Выбрано" : active ? "Фокус" : ""}</span>
					</div>
				)}
			/>
		);
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: "medium"
	},
	render: (args) => <StringListbox {...args} />
};
