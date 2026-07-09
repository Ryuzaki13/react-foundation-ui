import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react-vite";

import { InputNumber, InputText } from "../Input";

const meta = {
	title: "Shared/UI/Input",
	component: InputText,
	args: {
		value: "",
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
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
			description: "Плейсхолдер нативного поля ввода.",
			control: "text"
		},
		value: {
			description: "Текущее значение поля.",
			control: "text"
		},
		onChange: {
			description: "Вызывается при изменении значения.",
			control: false
		},
		onClear: {
			description: "Callback кнопки очистки справа.",
			control: false
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Вызывается при вводе для сброса внешней ошибки.",
			control: false
		},
		disabled: {
			description: "Блокирует редактирование.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		allowedPattern: {
			description: "Регулярное выражение для валидации введенной строки.",
			control: false
		}
	}
} satisfies Meta<typeof InputText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextControlled: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value ?? "");
		return <InputText {...args} value={value} onChange={setValue} onClear={() => setValue("")} />;
	},
	args: {
		label: "Наименование",
		description: "Пример обычного текстового поля.",
		placeholder: "Введите значение",
		value: "",
		size: "md"
	}
};

export const NumberControlled: Story = {
	render: () => {
		const [value, setValue] = useState<number | undefined>(25);

		return (
			<InputNumber
				label="Количество"
				description="Числовой ввод с min/max."
				placeholder="0"
				value={value}
				min={0}
				max={100}
				onChange={setValue}
				onClear={() => setValue(0)}
			/>
		);
	},
	args: {
		value: undefined
	}
};

export const PatternValidation: Story = {
	render: () => {
		const [value, setValue] = useState("");
		return (
			<InputText
				label="Только цифры"
				description="`allowedPattern` подсвечивает невалидный ввод."
				placeholder="12345"
				value={value}
				onChange={setValue}
				allowedPattern={/^\d*$/}
			/>
		);
	},
	args: {
		value: undefined
	}
};

export const WithError: Story = {
	render: () => {
		const [value, setValue] = useState("admin");
		const [error, setError] = useState("Логин уже занят");

		return (
			<InputText
				label="Логин"
				value={value}
				error={error}
				onChange={setValue}
				onClear={() => setValue("")}
				onClearError={() => setError("")}
			/>
		);
	},
	args: {
		value: undefined
	}
};
