import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { Toggle, type ToggleProps } from "../Toggle";

import type { Meta, StoryObj } from "@storybook/react-vite";

const renderToggleStory = createControlledStoryRender<ToggleProps>((args, updateArgs) => (
	<Toggle
		{...args}
		value={args.value ?? false}
		onChange={(value) => {
			args.onChange?.(value);
			updateArgs({ value });
		}}
	/>
));

const meta = {
	title: "UI/Toggle",
	component: Toggle,
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
			description: "Текст подписи переключателя.",
			control: "text"
		},
		description: {
			description: "Описание под переключателем.",
			control: "text"
		},
		placeholder: {
			description: "Резервная подпись, если `label` не задан.",
			control: "text"
		},
		value: {
			description: "Текущее значение переключателя.",
			control: "boolean"
		},
		onChange: {
			description: "Вызывается при изменении значения.",
			control: false
		},
		checkedText: {
			description: "Текст для включенного состояния.",
			control: "text"
		},
		uncheckedText: {
			description: "Текст для выключенного состояния.",
			control: "text"
		},
		labelPosition: {
			description: "Положение подписи относительно переключателя.",
			control: "inline-radio",
			options: ["before", "after"]
		},
		disabled: {
			description: "Блокирует взаимодействие.",
			control: "boolean"
		},
		size: {
			description: "Размер контрола и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<ToggleProps>;

export const Controlled: Story = {
	render: renderToggleStory,
	args: {
		label: "Режим синхронизации",
		description: "Мгновенное переключение состояния.",
		value: false,
		checkedText: "ВКЛ",
		uncheckedText: "ВЫКЛ",
		labelPosition: "before"
	}
};

export const LabelAfter: Story = {
	render: renderToggleStory,
	args: {
		label: "Уведомления",
		value: true,
		labelPosition: "after"
	}
};

export const Disabled: Story = {
	render: renderToggleStory,
	args: {
		label: "Недоступный переключатель",
		value: true,
		disabled: true
	}
};
