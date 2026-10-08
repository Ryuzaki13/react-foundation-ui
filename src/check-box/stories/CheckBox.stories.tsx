import { useState, type ComponentProps } from "react";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { CheckBox } from "../CheckBox";

import type { Meta, StoryObj } from "@storybook/react-vite";

type CheckBoxStoryArgs = ComponentProps<typeof CheckBox>;

const renderCheckBoxStory = createControlledStoryRender<CheckBoxStoryArgs>((args, updateArgs) => (
	<CheckBox
		{...args}
		value={args.value ?? false}
		onChange={(value) => {
			args.onChange?.(value);
			updateArgs({ value });
		}}
	/>
));

const meta = {
	title: "UI/CheckBox",
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
		noWrap: {
			description: "Не переносит текст подписи на новую строку.",
			control: "boolean"
		},
		indeterminate: {
			description: 'Показывает частично выбранное состояние с `aria-checked="mixed"`.',
			control: "boolean"
		}
	}
} satisfies Meta<CheckBoxStoryArgs>;

export default meta;
type Story = StoryObj<CheckBoxStoryArgs>;

export const Controlled: Story = {
	render: renderCheckBoxStory,
	args: {
		label: "Принимать условия",
		description: "Подтверждение условий использования сервиса.",
		value: false,
		size: "md",
		disabled: false
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
	render: renderCheckBoxStory,
	args: {
		label: "Недоступный чекбокс",
		description: "Изменение недоступно из-за прав доступа.",
		value: true,
		disabled: true
	}
};
