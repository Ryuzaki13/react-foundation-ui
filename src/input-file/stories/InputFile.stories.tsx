import { useState } from "react";

import { InputFile } from "../InputFile";

import type { ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";
import type { Meta, StoryObj } from "@storybook/react-vite";

const createMockReadFileResult = (name: string, mime: string = "application/pdf"): ReadFileResult => {
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

const meta = {
	title: "Shared/UI/InputFile",
	component: InputFile,
	args: {
		value: undefined,
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		label: {
			description: "Заголовок поля загрузки.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст в поле, пока файл не выбран.",
			control: "text"
		},
		value: {
			description: "Текущий результат чтения выбранного файла.",
			control: false
		},
		onChange: {
			description: "Вызывается после успешного чтения файла.",
			control: false
		},
		onReadError: {
			description: "Вызывается при ошибке чтения или валидации файла.",
			control: false
		},
		onClear: {
			description: "Очищает выбранный файл и показывает кнопку очистки.",
			control: false
		},
		accept: {
			description: "HTML `accept` для нативного диалога выбора файла.",
			control: "text"
		},
		allowedMime: {
			description: "Белый список MIME-типов для readFile-валидации.",
			control: false
		},
		maxBytes: {
			description: "Максимальный размер файла в байтах.",
			control: "number"
		},
		readMode: {
			description: "Режим чтения файла: data-url или array-buffer.",
			control: "inline-radio",
			options: ["data-url", "array-buffer"]
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Callback сброса ошибки при повторном выборе файла.",
			control: false
		},
		disabled: {
			description: "Блокирует выбор файла.",
			control: "boolean"
		},
		size: {
			description: "Размер визуального контрола.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof InputFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [value, setValue] = useState<ReadFileResult | undefined>(args.value);
		const [error, setError] = useState(args.error ?? "");

		return (
			<InputFile
				{...args}
				value={value}
				error={error || undefined}
				onChange={setValue}
				onClear={() => setValue(undefined)}
				onClearError={() => setError("")}
			/>
		);
	},
	args: {
		label: "Документ",
		description: "Загрузите один файл.",
		placeholder: "Выберите файл",
		accept: [".pdf", ".docx"],
		readMode: "data-url",
		value: undefined
	}
};

export const WithInitialValue: Story = {
	render: (args) => {
		const [value, setValue] = useState<ReadFileResult | undefined>(createMockReadFileResult("report.pdf"));
		return <InputFile {...args} value={value} onChange={setValue} onClear={() => setValue(undefined)} />;
	},
	args: {
		label: "Файл с предзаполнением",
		description: "Демонстрация состояния после успешной загрузки."
	}
};

export const ArrayBufferMode: Story = {
	render: (args) => {
		const [value, setValue] = useState<ReadFileResult | undefined>(undefined);
		return <InputFile {...args} value={value} onChange={setValue} onClear={() => setValue(undefined)} />;
	},
	args: {
		label: "Двоичное чтение",
		description: "Режим `array-buffer` для дальнейшей бинарной обработки.",
		readMode: "array-buffer",
		accept: [".zip", ".pdf"],
		value: undefined
	}
};
