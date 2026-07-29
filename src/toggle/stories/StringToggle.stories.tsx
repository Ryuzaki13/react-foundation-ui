import { useState } from "react";

import { StringToggle } from "../StringToggle";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Toggle/StringToggle",
	component: StringToggle,
	args: {
		value: "ZBP_MANAGER",
		onChange: () => undefined,
		checkedText: "за клиента",
		uncheckedText: "за сделку",
		checkedValue: "ZM_MANAGER",
		uncheckedValue: "ZBP_MANAGER"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		value: {
			description: "Текущее строковое значение.",
			control: false
		},
		onChange: {
			description: "Возвращает строку выбранного состояния.",
			control: false
		},
		checkedValue: {
			description: "Значение включённого состояния.",
			control: "text"
		},
		uncheckedValue: {
			description: "Значение выключенного состояния.",
			control: "text"
		},
		checkedText: {
			description: "Текст включённого состояния.",
			control: "text"
		},
		uncheckedText: {
			description: "Текст выключенного состояния.",
			control: "text"
		}
	}
} satisfies Meta<typeof StringToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManagerScope: Story = {
	render: (args) => {
		const [value, setValue] = useState<string>(args.value);

		return <StringToggle {...args} value={value} onChange={setValue} />;
	}
};
