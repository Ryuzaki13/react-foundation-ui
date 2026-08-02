import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { TagInput, type TagInputProps } from "../TagInput";

import type { Meta, StoryObj } from "@storybook/react-vite";

const renderTagInputStory = createControlledStoryRender<TagInputProps>((args, updateArgs) => (
	<TagInput
		{...args}
		value={args.value ?? []}
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
		label: {
			description: "Заголовок поля тегов.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Подсказка для черновика нового тега.",
			control: "text"
		},
		value: {
			description: "Controlled-набор добавленных тегов.",
			control: "object"
		},
		onChange: {
			description: "Возвращает новый набор после добавления или удаления тега.",
			control: false
		},
		error: {
			description: "Текст ошибки, связанный с полем через `aria-describedby`.",
			control: "text"
		},
		onClearError: {
			description: "Вызывается после изменения черновика или набора тегов.",
			control: false
		},
		disabled: {
			description: "Блокирует ввод и изменение набора тегов.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		maxTags: {
			description: "Максимальное количество тегов.",
			control: {
				type: "number",
				min: 0,
				step: 1
			}
		},
		readOnly: {
			description: "Показывает теги без действий добавления и удаления, сохраняя возможность копирования.",
			control: "boolean"
		},
		normalizeTag: {
			description: "Нормализует введенный тег до проверки дубликата и добавления.",
			control: false
		},
		getTagKey: {
			description: "Формирует ключ для сравнения тегов и поиска дубликатов.",
			control: false
		},
		addOnBlur: {
			description: "Добавляет непустой черновик при уходе фокуса с поля.",
			control: "boolean"
		},
		getRemoveButtonAriaLabel: {
			description: "Формирует доступное имя кнопки удаления конкретного тега.",
			control: false
		},
		tokensAriaLabel: {
			description: "Доступное имя списка уже добавленных тегов.",
			control: "text"
		},
		inputClassName: {
			description: "CSS-класс внутреннего поля черновика тега.",
			control: "text"
		}
	}
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<TagInputProps>;

export const Controlled: Story = {
	render: renderTagInputStory,
	args: {
		label: "Теги материала",
		description: "Введите значение и нажмите Enter или запятую. Можно вставить сразу несколько строк.",
		placeholder: "Добавить тег",
		value: ["Новости", "Колледж"],
		maxTags: 10,
		getTagKey: (tag) => tag.toLocaleLowerCase("ru")
	}
};

export const ReadOnly: Story = {
	render: renderTagInputStory,
	args: {
		label: "Теги материала",
		value: ["Новости", "Колледж"],
		readOnly: true
	}
};
