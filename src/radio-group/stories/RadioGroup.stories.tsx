import { useState } from "react";

import { RadioGroup } from "../RadioGroup";

import type { Meta, StoryObj } from "@storybook/react-vite";

function StringRadioGroup(props: {
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	noWrap?: true;
	orientation?: "vertical" | "horizontal";
	children: React.ReactNode;
}) {
	return <RadioGroup<string> {...props} />;
}

const meta = {
	title: "Shared/UI/RadioGroup",
	component: StringRadioGroup,
	args: {
		value: "email",
		onChange: () => {},
		orientation: "horizontal",
		label: "Канал уведомлений",
		description: "Выберите основной канал доставки",
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		value: {
			description: "Текущее выбранное значение.",
			control: "text"
		},
		onChange: {
			description: "Вызывается при смене выбранной опции.",
			control: false
		},
		label: {
			description: "Заголовок группы опций.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		disabled: {
			description: "Блокирует выбор опций.",
			control: "boolean"
		},
		noWrap: {
			description: "Запрещает перенос опций на новую строку.",
			control: "boolean"
		},
		orientation: {
			description: "Ориентация расположения опций.",
			control: "inline-radio",
			options: ["horizontal", "vertical"]
		},
		className: {
			description: "Дополнительный CSS-класс контейнера.",
			control: "text"
		},
		children: {
			description: "Элементы `RadioGroup.Option` внутри группы.",
			control: false
		}
	}
} satisfies Meta<typeof StringRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState("email");

		return (
			<div style={{ display: "grid", gap: 10 }}>
				<StringRadioGroup {...args} value={value} onChange={setValue}>
					<RadioGroup.Option value="email" label="Email" description="Письма на корпоративную почту" />
					<RadioGroup.Option value="sms" label="SMS" description="Сообщения на телефон" />
					<RadioGroup.Option value="push" label="Push" description="Уведомления в приложении" />
				</StringRadioGroup>
				<div>Выбрано: {value}</div>
			</div>
		);
	},
	args: {
		children: undefined
	}
};

export const Vertical: Story = {
	render: (args) => {
		const [value, setValue] = useState("draft");

		return (
			<StringRadioGroup {...args} value={value} onChange={setValue} orientation="vertical" label="Статус документа">
				<RadioGroup.Option value="draft" label="Черновик" />
				<RadioGroup.Option value="review" label="На согласовании" />
				<RadioGroup.Option value="approved" label="Утвержден" />
			</StringRadioGroup>
		);
	},
	args: {
		orientation: "vertical",
		children: undefined
	}
};

export const Disabled: Story = {
	render: (args) => (
		<StringRadioGroup {...args} disabled>
			<RadioGroup.Option value="yes" label="Да" />
			<RadioGroup.Option value="no" label="Нет" />
		</StringRadioGroup>
	),
	args: {
		disabled: true,
		value: "yes",
		children: undefined
	}
};
