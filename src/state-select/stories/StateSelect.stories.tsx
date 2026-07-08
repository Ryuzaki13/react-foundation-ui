import { useState } from "react";

import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, MinusCircleIcon, XCircleIcon } from "lucide-react";

import { StateSelect } from "../StateSelect";

import type { State } from "@ryuzaki13/react-foundation-lib/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/StateSelect",
	component: StateSelect,
	args: {
		label: "Состояние",
		description: "Выберите визуальный статус.",
		placeholder: "Выберите значение",
		value: "information",
		onChange: () => {},
		disabled: false,
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
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
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		className: {
			description: "Дополнительный CSS-класс.",
			control: "text"
		}
	}
} satisfies Meta<typeof StateSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState<State | undefined>("information");
		return <StateSelect {...args} value={value} onChange={setValue} />;
	}
};

export const WithMeta: Story = {
	render: (args) => {
		const [value, setValue] = useState<State | undefined>("warning");

		return (
			<StateSelect
				{...args}
				value={value}
				onChange={setValue}
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
	render: (args) => {
		const [value, setValue] = useState<State | undefined>("none");
		return <StateSelect {...args} value={value} onChange={setValue} options={["none", "success", "error"]} />;
	},
	args: {
		options: ["none", "success", "error"],
		value: "none"
	}
};
