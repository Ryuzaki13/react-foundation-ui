import { useState } from "react";

import { TagInput } from "../TagInput";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/TagInput",
	component: TagInput,
	args: {
		value: [],
		onChange: () => undefined
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		value: {
			description: "Controlled-набор добавленных тегов.",
			control: false
		},
		onChange: {
			description: "Возвращает новый набор после добавления или удаления тега.",
			control: false
		},
		maxTags: {
			description: "Максимальное количество тегов.",
			control: "number"
		},
		readOnly: {
			description: "Показывает набор без действий изменения.",
			control: "boolean"
		},
		normalizeTag: {
			control: false
		},
		getTagKey: {
			control: false
		},
		getRemoveButtonAriaLabel: {
			control: false
		}
	}
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState<readonly string[]>(["Новости", "Колледж"]);

		return (
			<TagInput
				{...args}
				label="Теги материала"
				description="Введите значение и нажмите Enter или запятую. Можно вставить сразу несколько строк."
				placeholder="Добавить тег"
				value={value}
				onChange={setValue}
				maxTags={10}
				getTagKey={(tag) => tag.toLocaleLowerCase("ru")}
			/>
		);
	}
};

export const ReadOnly: Story = {
	args: {
		label: "Теги материала",
		value: ["Новости", "Колледж"],
		readOnly: true
	}
};
