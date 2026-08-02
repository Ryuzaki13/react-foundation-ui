import { useState, type ComponentProps } from "react";

import { useArgs } from "storybook/preview-api";

import { RadioButton } from "../RadioButton";

import type { Meta, StoryObj } from "@storybook/react-vite";

type RadioButtonStoryArgs = ComponentProps<typeof RadioButton>;

function RadioButtonStoryCanvas({ args }: { args: RadioButtonStoryArgs }) {
	const [, updateArgs] = useArgs<RadioButtonStoryArgs>();

	return (
		<RadioButton
			{...args}
			value={args.value ?? false}
			onChange={(value) => {
				args.onChange?.(value);
				updateArgs({ value });
			}}
		/>
	);
}

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
			description: "Цветовой тон радиокнопки.",
			control: "inline-radio",
			options: ["neutral", "brand", "error", "warning", "success", "info"]
		}
	}
} satisfies Meta<RadioButtonStoryArgs>;

export default meta;
type Story = StoryObj<RadioButtonStoryArgs>;

export const Controlled: Story = {
	render: function Render(args) {
		return <RadioButtonStoryCanvas args={args} />;
	},
	args: {
		label: "Выбрать опцию",
		description: "Одиночная радиокнопка в controlled-режиме.",
		value: false,
		tone: "neutral"
	}
};

export const Group: Story = {
	render: () => {
		const [selected, setSelected] = useState<"email" | "sms">("email");

		return (
			<div role="radiogroup" aria-label="Канал уведомлений" style={{ display: "grid", gap: 12 }}>
				<RadioButton
					label="Email"
					value={selected === "email"}
					onChange={(checked) => checked && setSelected("email")}
					tone="info"
				/>
				<RadioButton label="SMS" value={selected === "sms"} onChange={(checked) => checked && setSelected("sms")} tone="info" />
			</div>
		);
	},
	args: {
		value: undefined
	}
};

export const Disabled: Story = {
	render: function Render(args) {
		return <RadioButtonStoryCanvas args={args} />;
	},
	args: {
		label: "Недоступная опция",
		description: "Заблокировано политикой конфигурации.",
		value: true,
		disabled: true,
		tone: "neutral"
	}
};
