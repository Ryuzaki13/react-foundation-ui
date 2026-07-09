import { useState } from "react";

import { RadioButton } from "../RadioButton";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/RadioButton",
	component: RadioButton,
	args: {
		value: false,
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Текст подписи радиокнопки.",
			control: "text"
		},
		description: {
			description: "Дополнительное описание под элементом.",
			control: "text"
		},
		placeholder: {
			description: "Резервная подпись, если `label` не задан.",
			control: "text"
		},
		value: {
			description: "Признак выбранного состояния.",
			control: "boolean"
		},
		onChange: {
			description: "Вызывается при изменении выбранности.",
			control: false
		},
		disabled: {
			description: "Блокирует взаимодействие.",
			control: "boolean"
		},
		size: {
			description: "Размер визуального контрола и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		tone: {
			description: "Семантический тон радиокнопки.",
			control: "inline-radio",
			options: ["neutral", "error", "warning", "success", "info"]
		},
		name: {
			description: "HTML `name` для группировки кнопок.",
			control: "text"
		}
	}
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value ?? false);
		return <RadioButton {...args} value={value} onChange={setValue} />;
	},
	args: {
		label: "Выбрать опцию",
		description: "Одиночная радиокнопка в controlled-режиме.",
		value: false,
		name: "single-radio",
		tone: "neutral"
	}
};

export const Group: Story = {
	render: () => {
		const [selected, setSelected] = useState<"email" | "sms">("email");

		return (
			<div role="radiogroup" aria-label="Канал уведомлений" style={{ display: "grid", gap: 12 }}>
				<RadioButton
					name="notify-channel"
					label="Email"
					value={selected === "email"}
					onChange={(checked) => checked && setSelected("email")}
					tone="info"
				/>
				<RadioButton
					name="notify-channel"
					label="SMS"
					value={selected === "sms"}
					onChange={(checked) => checked && setSelected("sms")}
					tone="info"
				/>
			</div>
		);
	},
	args: {
		value: undefined
	}
};

export const Disabled: Story = {
	args: {
		label: "Недоступная опция",
		description: "Заблокировано политикой конфигурации.",
		value: true,
		disabled: true,
		tone: "neutral"
	}
};
