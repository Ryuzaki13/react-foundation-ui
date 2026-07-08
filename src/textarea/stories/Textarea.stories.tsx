import { useState } from "react";

import { Textarea } from "../Textarea";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Textarea",
	component: Textarea,
	args: {
		label: "Комментарий",
		description: "Оставьте примечание к документу.",
		placeholder: "Введите текст...",
		rows: 4,
		disabled: false,
		value: "",
		onChange: () => undefined
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		label: {
			description: "Заголовок текстовой области.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Плейсхолдер поля ввода.",
			control: "text"
		},
		value: {
			description: "Текущее значение текстовой области.",
			control: "text"
		},
		onChange: {
			description: "Вызывается при изменении текста.",
			control: false
		},
		rows: {
			description: "Количество видимых строк.",
			control: "number"
		},
		cols: {
			description: "Ширина в количестве символов.",
			control: "number"
		},
		disabled: {
			description: "Блокирует редактирование.",
			control: "boolean"
		},
		className: {
			description: "Дополнительный CSS-класс.",
			control: "text"
		}
	}
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	args: {
		value: "",
		onChange: () => undefined
	},
	render: (args) => {
		const [value, setValue] = useState("Первичный комментарий");

		return <Textarea {...args} value={value} onChange={setValue} />;
	}
};

export const WithValue: Story = {
	args: {
		rows: 5,
		value: "",
		onChange: () => undefined
	},
	render: (args) => {
		const [value, setValue] = useState("Шаблонный текст для редактирования.");

		return <Textarea {...args} value={value} onChange={setValue} />;
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: "Редактирование недоступно.",
		onChange: () => undefined
	},
	render: (args) => <Textarea {...args} />
};
