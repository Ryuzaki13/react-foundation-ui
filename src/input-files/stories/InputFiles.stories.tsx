import { fn } from "storybook/test";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { InputFiles, type InputFilesProps } from "../InputFiles";

import type { ReadFileAsDataUrlResult } from "@ryuzaki13/react-foundation-lib/file";
import type { Meta, StoryObj } from "@storybook/react-vite";

const createMockReadFileResult = (name: string, mime: string = "application/pdf"): ReadFileAsDataUrlResult => {
	const file = new File(["demo-file"], name, { type: mime, lastModified: 1704067200000 });

	return {
		mode: "data-url",
		meta: {
			name: file.name,
			mime: file.type,
			size: file.size,
			lastModified: file.lastModified
		},
		dataUrl: `data:${mime};base64,ZGVtby1maWxl`,
		file
	};
};

type DataUrlInputFilesProps = Extract<InputFilesProps, { readMode?: "data-url" }>;

const meta = {
	title: "Shared/UI/InputFiles",
	component: InputFiles,
	args: {
		value: [] as ReadFileAsDataUrlResult[],
		onChange: fn<DataUrlInputFilesProps["onChange"]>(),
		readMode: "data-url"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок поля множественной загрузки.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст в поле, пока список файлов пуст.",
			control: "text"
		},
		value: {
			description: "Массив результатов чтения выбранных файлов.",
			control: false
		},
		onChange: {
			description: "Вызывается с новым массивом файлов после добавления/удаления.",
			control: false
		},
		onReadError: {
			description: "Вызывается при ошибке чтения отдельного файла.",
			control: false
		},
		accept: {
			description: "HTML `accept` для диалога выбора файлов.",
			control: "object"
		},
		allowedMime: {
			description: "Список допустимых MIME-типов при валидации.",
			control: false
		},
		maxBytes: {
			description: "Максимальный размер одного файла в байтах.",
			control: "number"
		},
		readMode: {
			description: "Режим чтения: data-url или array-buffer.",
			control: "inline-radio",
			options: ["data-url", "array-buffer"]
		},
		maxFiles: {
			description: "Лимит количества файлов в списке.",
			control: "number"
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Вызывается при выборе новых файлов для сброса ошибки.",
			control: false
		},
		disabled: {
			description: "Полностью блокирует выбор файлов.",
			control: "boolean"
		},
		size: {
			description: "Размер визуального контрола.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof InputFiles>;

export default meta;
type Story = StoryObj<DataUrlInputFilesProps>;

const renderInputFilesStory = createControlledStoryRender<DataUrlInputFilesProps>((args, updateArgs) => (
	<InputFiles
		{...args}
		onChange={(value) => {
			args.onChange(value);
			updateArgs({ value });
		}}
		onClearError={() => {
			args.onClearError?.();
			updateArgs({ error: undefined });
		}}
	/>
));

export const Controlled: Story = {
	render: renderInputFilesStory,
	args: {
		label: "Вложения",
		description: "Можно выбрать несколько файлов.",
		placeholder: "Выберите файлы",
		accept: [".pdf", ".png", ".jpg"],
		maxFiles: 5,
		value: []
	}
};

export const WithInitialFiles: Story = {
	render: renderInputFilesStory,
	args: {
		label: "Предзаполненный список",
		description: "Иллюстрация удаления файлов из уже заполненного значения.",
		value: [createMockReadFileResult("contract.pdf"), createMockReadFileResult("diagram.png", "image/png")]
	}
};

export const LimitReached: Story = {
	render: renderInputFilesStory,
	args: {
		label: "Лимит файлов",
		description: "После достижения лимита поле выбора блокируется.",
		maxFiles: 2,
		value: [createMockReadFileResult("first.pdf"), createMockReadFileResult("second.pdf")]
	}
};
