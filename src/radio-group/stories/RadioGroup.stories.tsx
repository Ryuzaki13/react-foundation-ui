import type { ReactNode } from "react";

import { useArgs } from "storybook/preview-api";

import { RadioGroup } from "../RadioGroup";

import type { Meta, StoryObj } from "@storybook/react-vite";

type StringRadioGroupProps = {
	value?: string;
	onChange?: (value: string) => void;
	label?: string;
	description?: string;
	disabled?: boolean;
	noWrap?: true;
	orientation?: "vertical" | "horizontal";
	"aria-label"?: string;
	children: ReactNode;
};

type RadioGroupOption = {
	value: string;
	label: ReactNode;
	description?: ReactNode;
};

function StringRadioGroup(props: StringRadioGroupProps) {
	return <RadioGroup<string> {...props} />;
}

function RadioGroupStoryCanvas({
	args,
	options,
	showValue = false
}: {
	args: StringRadioGroupProps;
	options: readonly RadioGroupOption[];
	showValue?: boolean;
}) {
	const [, updateArgs] = useArgs<StringRadioGroupProps>();

	return (
		<div style={{ display: "grid", gap: 10 }}>
			<StringRadioGroup
				{...args}
				onChange={(value) => {
					args.onChange?.(value);
					updateArgs({ value });
				}}>
				{options.map((option) => (
					<RadioGroup.Option key={option.value} value={option.value} label={option.label} description={option.description} />
				))}
			</StringRadioGroup>
			{showValue && <div>Выбрано: {args.value ?? "не выбрано"}</div>}
		</div>
	);
}

const notificationOptions = [
	{ value: "email", label: "Email", description: "Письма на корпоративную почту" },
	{ value: "sms", label: "SMS", description: "Сообщения на телефон" },
	{ value: "push", label: "Push", description: "Уведомления в приложении" }
] as const satisfies readonly RadioGroupOption[];

const documentStatusOptions = [
	{ value: "draft", label: "Черновик" },
	{ value: "review", label: "На согласовании" },
	{ value: "approved", label: "Утвержден" }
] as const satisfies readonly RadioGroupOption[];

const confirmationOptions = [
	{ value: "yes", label: "Да" },
	{ value: "no", label: "Нет" }
] as const satisfies readonly RadioGroupOption[];

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
		children: {
			description: "Элементы `RadioGroup.Option` внутри группы.",
			control: false
		}
	}
} satisfies Meta<StringRadioGroupProps>;

export default meta;
type Story = StoryObj<StringRadioGroupProps>;

export const Controlled: Story = {
	render: function Render(args) {
		return <RadioGroupStoryCanvas args={args} options={notificationOptions} showValue />;
	},
	args: {}
};

export const Vertical: Story = {
	render: function Render(args) {
		return <RadioGroupStoryCanvas args={args} options={documentStatusOptions} />;
	},
	args: {
		orientation: "vertical",
		label: "Статус документа",
		value: "draft"
	}
};

export const Disabled: Story = {
	render: function Render(args) {
		return <RadioGroupStoryCanvas args={args} options={confirmationOptions} />;
	},
	args: {
		disabled: true,
		value: "yes"
	}
};
