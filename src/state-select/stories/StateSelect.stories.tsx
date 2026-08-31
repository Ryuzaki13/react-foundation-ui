import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, MinusCircleIcon, XCircleIcon } from "lucide-react";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { StateSelect, type StateSelectProps } from "../StateSelect";

import type { State } from "@ryuzaki13/react-foundation-lib/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/StateSelect",
	component: StateSelect,
	args: {
		label: "Состояние",
		description: "Выберите визуальный статус.",
		placeholder: "Выберите значение",
		value: "information",
		onChange: fn<(value: State | undefined) => void>(),
		disabled: false,
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок поля выбора состояния.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст, когда значение не выбрано.",
			control: "text"
		},
		value: {
			description: "Текущее состояние.",
			control: "select",
			options: ["", "none", "information", "success", "warning", "error"]
		},
		onChange: {
			description: "Вызывается при выборе состояния.",
			control: false
		},
		options: {
			description: "Кастомный набор доступных состояний.",
			control: false
		},
		stateMeta: {
			description: "Кастомные иконки и подписи для значений.",
			control: false
		},
		disabled: {
			description: "Блокирует взаимодействие с полем.",
			control: "boolean"
		},
		clearable: {
			description: "Показывает действие очистки выбранного состояния.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof StateSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<StateSelectProps>();

		return (
			<StateSelect
				{...args}
				value={args.value ?? "information"}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	}
};

export const WithMeta: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<StateSelectProps>();
		return (
			<StateSelect
				{...args}
				value={args.value ?? "warning"}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				stateMeta={{
					none: { label: "Без статуса", icon: <MinusCircleIcon /> },
					information: { label: "Инфо", icon: <InfoIcon /> },
					success: { label: "Успех", icon: <CheckCircle2Icon /> },
					warning: { label: "Предупреждение", icon: <AlertTriangleIcon /> },
					error: { label: "Ошибка", icon: <XCircleIcon /> }
				}}
			/>
		);
	},
	args: {
		value: "warning"
	}
};

export const PaletteOnly: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<StateSelectProps>();

		return (
			<StateSelect
				{...args}
				value={args.value ?? "none"}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				options={["none", "success", "error"]}
			/>
		);
	},
	args: {
		options: ["none", "success", "error"],
		value: "none"
	}
};
