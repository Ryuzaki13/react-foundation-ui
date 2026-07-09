import { useState } from "react";

import { Meta, StoryObj } from "@storybook/react-vite";

import { CheckBox } from "../CheckBox";

const meta = {
	title: "Shared/UI/CheckBox",
	component: CheckBox,
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
			description: "Текст основной подписи чекбокса.",
			control: "text"
		},
		description: {
			description: "Дополнительное описание под элементом.",
			control: "text"
		},
		placeholder: {
			description: "Текст подписи, если `label` не задан.",
			control: "text"
		},
		value: {
			description: "Текущее состояние чекбокса.",
			control: "boolean"
		},
		onChange: {
			description: "Вызывается при изменении состояния.",
			control: false
		},
		disabled: {
			description: "Блокирует взаимодействие с элементом.",
			control: "boolean"
		},
		size: {
			description: "Размер визуального контрола и текста.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		tone: {
			description: "Семантический тон чекбокса.",
			control: "inline-radio",
			options: ["neutral", "error", "warning", "success", "info"]
		}
	}
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value ?? false);
		return <CheckBox {...args} value={value} onChange={setValue} />;
	},
	args: {
		label: "Принимать условия",
		description: "Подтверждение условий использования сервиса.",
		value: false,
		size: "md",
		disabled: false,
		tone: "neutral"
	}
};

export const Tones: Story = {
	render: () => {
		const [values, setValues] = useState<Record<string, boolean>>({
			neutral: true,
			info: true,
			success: true,
			warning: true,
			error: true
		});

		return (
			<div style={{ display: "grid", gap: 12 }}>
				{(["neutral", "info", "success", "warning", "error"] as const).map((tone) => (
					<CheckBox
						key={tone}
						tone={tone}
						label={`Тон ${tone}`}
						value={values[tone]}
						onChange={(next) => setValues((prev) => ({ ...prev, [tone]: next }))}
					/>
				))}
			</div>
		);
	}
};

export const Sizes: Story = {
	render: () => {
		const [values, setValues] = useState<Record<string, boolean>>({
			xs: false,
			sm: true,
			md: false,
			lg: true,
			xl: false
		});

		return (
			<div style={{ display: "grid", gap: 12 }}>
				{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
					<CheckBox
						key={size}
						size={size}
						label={`Размер ${size}`}
						value={values[size]}
						onChange={(next) => setValues((prev) => ({ ...prev, [size]: next }))}
					/>
				))}
			</div>
		);
	}
};

export const Disabled: Story = {
	args: {
		label: "Недоступный чекбокс",
		description: "Изменение недоступно из-за прав доступа.",
		value: true,
		disabled: true,
		tone: "neutral"
	}
};
