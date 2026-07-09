import { useState } from "react";

import { Switch } from "../Switch";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Switch",
	component: Switch,
	args: {
		label: "Режим обработки",
		description: "Переключение состояния",
		value: false,
		onChange: () => {},
		triState: false,
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок переключателя.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		value: {
			description: "Текущее значение (`boolean` или `undefined` в tri-state).",
			control: false
		},
		onChange: {
			description: "Вызывается при изменении состояния.",
			control: false
		},
		triState: {
			description: "Включает трехсостоянный режим (`undefined → true → false`).",
			control: "boolean"
		},
		checkedIcon: {
			description: "Кастомная иконка для состояния `true`.",
			control: false
		},
		uncheckedIcon: {
			description: "Кастомная иконка для состояния `false`.",
			control: false
		},
		disabled: {
			description: "Блокирует переключение.",
			control: "boolean"
		}
	}
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BiState: Story = {
	render: (args) => {
		const [value, setValue] = useState(false);
		return <Switch {...args} value={value} onChange={setValue} triState={false} />;
	}
};

export const TriState: Story = {
	render: (args) => {
		const [value, setValue] = useState<boolean | undefined>(undefined);
		return (
			<div style={{ display: "grid", gap: 8 }}>
				<Switch {...args} value={value} onChange={setValue} triState />
				<div>Текущее значение: {String(value)}</div>
			</div>
		);
	},
	args: {
		triState: true,
		value: undefined
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: true
	}
};
