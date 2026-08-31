import type { ComponentType } from "react";

import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { InputDate, InputDateTime, InputTime, type InputDateProps } from "../InputDateTime";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/InputDateTime",
	component: InputDate,
	args: {
		value: undefined,
		onChange: fn<NonNullable<InputDateProps["onChange"]>>()
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
			description: "Общий placeholder-параметр сегментного поля.",
			control: "text"
		},
		value: {
			description: "Текущее значение в виде `Date`.",
			control: false
		},
		onChange: {
			description: "Вызывается при формировании валидной даты/времени.",
			control: false
		},
		mask: {
			description: "Маска сегментов (`YYYY`, `MM`, `DD`, `hh`, `mm`, `ss`).",
			control: "text"
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Сброс внешней ошибки при вводе.",
			control: false
		},
		onClear: {
			description: "Очищает значение и активирует кнопку очистки.",
			control: false
		},
		disabled: {
			description: "Блокирует редактирование сегментов.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		"aria-label": {
			description: "Явное доступное имя контейнера сегментного ввода; заменяет связь с видимой подписью.",
			control: "text"
		}
	}
} satisfies Meta<typeof InputDate>;

export default meta;
type Story = StoryObj<typeof meta>;

type InputDateTimeStoryCanvasProps = InputDateProps & {
	component: ComponentType<InputDateProps>;
};

function InputDateTimeStoryCanvas({ component, ...args }: InputDateTimeStoryCanvasProps) {
	const [, updateArgs] = useArgs<InputDateProps>();
	const Component = component;

	return (
		<Component
			{...args}
			onChange={(value) => {
				args.onChange(value);
				updateArgs({ value });
			}}
			onClear={() => {
				args.onClear?.();
				updateArgs({ value: undefined });
			}}
			onClearError={() => {
				args.onClearError?.();
				updateArgs({ error: undefined });
			}}
		/>
	);
}

export const DateOnly: Story = {
	render: function Render(args) {
		return <InputDateTimeStoryCanvas {...args} component={InputDate} />;
	},
	args: {
		label: "Дата",
		description: "Формат по умолчанию: YYYY.MM.DD",
		value: new Date(2026, 2, 5)
	}
};

export const TimeOnly: Story = {
	render: function Render(args) {
		return <InputDateTimeStoryCanvas {...args} component={InputTime} />;
	},
	args: {
		label: "Время",
		description: "Формат по умолчанию: hh:mm",
		value: new Date(2026, 2, 5, 14, 30, 0)
	}
};

export const DateAndTime: Story = {
	render: function Render(args) {
		return <InputDateTimeStoryCanvas {...args} component={InputDateTime} />;
	},
	args: {
		label: "Дата и время",
		description: "Комбинированный ввод даты и времени.",
		value: new Date(2026, 2, 5, 9, 15, 0)
	}
};

export const CustomMask: Story = {
	render: function Render(args) {
		return <InputDateTimeStoryCanvas {...args} component={InputDateTime} />;
	},
	args: {
		label: "Кастомная маска",
		description: "Добавлены секунды: YYYY.MM.DD hh:mm:ss",
		mask: "YYYY.MM.DD hh:mm:ss",
		value: new Date(2026, 2, 5, 9, 15, 42)
	}
};
