import { type ComponentProps } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { InputSearch } from "../index";

const meta = {
	title: "UI/InputSearch",
	component: InputSearch,
	args: {
		value: "alpha",
		onChange: fn<(value: string) => void>(),
		label: "Поиск"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		value: {
			description: "Подтверждённый запрос. Внешнее изменение заменяет черновик без пересоздания поля и потери фокуса.",
			control: "text"
		},
		defaultValue: {
			description: "Только начальный черновик; последующие изменения defaultValue не сбрасывают ввод.",
			control: "text"
		},
		onChange: {
			description: "Обрезанный запрос по Enter/blur или пустая строка при очистке. Обычный ввод callback не вызывает.",
			control: false
		}
	}
} satisfies Meta<typeof InputSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderControlledSearch = createControlledStoryRender<ComponentProps<typeof InputSearch>>((args, updateArgs) => (
	<InputSearch
		{...args}
		onChange={(value) => {
			args.onChange(value);
			updateArgs({ value });
		}}
	/>
));

export const Controlled: Story = {
	render: renderControlledSearch,
	args: {
		description: "Введите запрос и нажмите Enter. Для внешнего перехода измените value в Controls: фокус и DOM поля сохраняются."
	}
};

export const LocalDraft: Story = {
	args: {
		value: "",
		defaultValue: "Начальный запрос",
		description: "Постоянный value не стирает локальный ввод; callback сообщает только подтверждение поиска."
	}
};
