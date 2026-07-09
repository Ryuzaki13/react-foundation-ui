import { useState } from "react";

import { InputDate, InputDateTime, InputTime } from "../InputDateTime";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/InputDateTime",
	component: InputDate,
	args: {
		value: undefined,
		onChange: () => {}
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
			description: "ARIA-метка для контейнера сегментного ввода.",
			control: "text"
		}
	}
} satisfies Meta<typeof InputDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateOnly: Story = {
	render: (args) => {
		const [value, setValue] = useState<Date | undefined>(args.value);
		return <InputDate {...args} value={value} onChange={setValue} onClear={() => setValue(undefined)} />;
	},
	args: {
		label: "Дата",
		description: "Формат по умолчанию: YYYY.MM.DD",
		value: new Date(2026, 2, 5)
	}
};

export const TimeOnly: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date(2026, 2, 5, 14, 30, 0));
		return (
			<InputTime
				label="Время"
				description="Формат по умолчанию: hh:mm"
				value={value}
				onChange={setValue}
				onClear={() => setValue(undefined)}
			/>
		);
	},
	args: {
		value: undefined
	}
};

export const DateAndTime: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date(2026, 2, 5, 9, 15, 0));
		return (
			<InputDateTime
				label="Дата и время"
				description="Комбинированный ввод даты и времени."
				value={value}
				onChange={setValue}
				onClear={() => setValue(undefined)}
			/>
		);
	},
	args: {
		value: undefined
	}
};

export const CustomMask: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date(2026, 2, 5, 9, 15, 42));
		return (
			<InputDateTime
				label="Кастомная маска"
				description="Добавлены секунды: YYYY.MM.DD hh:mm:ss"
				mask="YYYY.MM.DD hh:mm:ss"
				value={value}
				onChange={setValue}
			/>
		);
	},
	args: {
		value: undefined
	}
};
