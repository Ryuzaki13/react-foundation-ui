import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { Textarea, type TextareaProps } from "../Textarea";

import type { Meta, StoryObj } from "@storybook/react-vite";

const renderTextareaStory = createControlledStoryRender<TextareaProps>((args, updateArgs) => (
	<Textarea
		{...args}
		value={args.value ?? ""}
		onChange={(value) => {
			args.onChange?.(value);
			updateArgs({ value });
		}}
		onClearError={() => {
			args.onClearError?.();
			updateArgs({ error: undefined });
		}}
	/>
));

const meta = {
	title: "UI/Textarea",
	component: Textarea,
	args: {
		label: "Комментарий",
		description: "Оставьте примечание к документу.",
		placeholder: "Введите текст...",
		disabled: false,
		value: "",
		onChange: () => undefined
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
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
		}
	}
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<TextareaProps>;

export const Controlled: Story = {
	args: {
		value: "Первичный комментарий"
	},
	render: renderTextareaStory
};

export const WithValue: Story = {
	args: {
		value: "Шаблонный текст для редактирования."
	},
	render: renderTextareaStory
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: "Редактирование недоступно."
	},
	render: renderTextareaStory
};
