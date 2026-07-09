import { useState } from "react";

import { UploadCloudIcon } from "lucide-react";

import { DropZone } from "../DropZone";

import type { ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/DropZone",
	component: DropZone,
	args: {
		value: [],
		onChange: () => {},
		multiple: true,
		readMode: "data-url",
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		onChange: {
			description: "Вызывается с массивом успешно прочитанных файлов.",
			control: false
		},
		onChangeError: {
			description: "Вызывается при ошибке валидации или чтения файла.",
			control: false
		},
		allowedMime: {
			description: "Список допустимых MIME-типов для проверки.",
			control: false
		},
		maxBytes: {
			description: "Максимальный размер одного файла в байтах.",
			control: "number"
		},
		readMode: {
			description: "Режим чтения файлов: data-url или array-buffer.",
			control: "inline-radio",
			options: ["data-url", "array-buffer"]
		},
		multiple: {
			description: "Разрешает принимать несколько файлов за один drop.",
			control: "boolean"
		},
		disabled: {
			description: "Блокирует зону и обработку drop-событий.",
			control: "boolean"
		},
		children: {
			description: "Кастомный контент внутри drop-зоны.",
			control: false
		},
		className: {
			description: "Дополнительный CSS-класс контейнера.",
			control: "text"
		}
	}
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: (args) => {
		const [files, setFiles] = useState<ReadFileResult[]>([]);

		return (
			<div style={{ display: "grid", gap: 12 }}>
				<DropZone {...args} onChange={(results) => setFiles(results)} />
				<div style={{ fontSize: 14 }}>
					{files.length > 0 ? `Получено файлов: ${files.length}` : "Перетащите файл(ы) в область выше"}
				</div>
			</div>
		);
	}
};

export const SingleFile: Story = {
	render: (args) => (
		<DropZone {...args} multiple={false}>
			<div style={{ display: "grid", placeItems: "center", gap: 6, minHeight: 120 }}>
				<UploadCloudIcon />
				<span>Перетащите один файл</span>
			</div>
		</DropZone>
	),
	args: {
		multiple: false
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		multiple: true
	}
};
