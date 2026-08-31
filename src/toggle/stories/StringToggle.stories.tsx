import { useArgs } from "storybook/preview-api";

import { StringToggle, type StringToggleProps } from "../StringToggle";

import type { Meta, StoryObj } from "@storybook/react-vite";

function StringToggleStoryCanvas({ args }: { args: StringToggleProps }) {
	const [, updateArgs] = useArgs<StringToggleProps>();

	return (
		<StringToggle
			{...args}
			onChange={(value) => {
				args.onChange(value);
				updateArgs({ value });
			}}
		/>
	);
}

const meta = {
	title: "UI/Toggle/StringToggle",
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
			description: "Текущее строковое значение.",
			control: "text"
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
} satisfies Meta<typeof StringToggle>;

export default meta;
type Story = StoryObj<StringToggleProps>;

export const ManagerScope: Story = {
	render: function Render(args) {
		return <StringToggleStoryCanvas args={args} />;
	}
};
