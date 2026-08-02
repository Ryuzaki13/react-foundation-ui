import { type ReactNode } from "react";

import { UploadCloudIcon } from "lucide-react";
import { fn } from "storybook/test";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { DropZone, type DropZoneProps } from "../DropZone";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/DropZone",
	component: DropZone,
	args: {
		value: [],
		onChange: fn<DropZoneProps["onChange"]>(),
		onChangeError: fn<NonNullable<DropZoneProps["onChangeError"]>>(),
		multiple: true,
		readMode: "data-url",
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		value: {
			description: "Текущий массив успешно прочитанных файлов.",
			control: false
		},
		onChange: {
			description: "Вызывается с массивом успешно прочитанных файлов.",
			control: false
		},
		onChangeError: {
			description: "Вызывается при ошибке валидации или чтения файла.",
			control: false
		},
		accept: {
			description: "Допустимые расширения или MIME-типы для нативного input.",
			control: "object"
		},
		allowedMime: {
			description: "Список допустимых MIME-типов для проверки.",
			control: "object"
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
		}
	}
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

function createDropZoneStoryRender({ showStatus = false, children }: { showStatus?: boolean; children?: ReactNode } = {}) {
	return createControlledStoryRender<DropZoneProps>((args, updateArgs) => (
		<div style={{ display: "grid", gap: 12 }}>
			<DropZone
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				children={children ?? args.children}
			/>
			{showStatus && (
				<div style={{ fontSize: 14 }}>
					{args.value.length > 0 ? `Получено файлов: ${args.value.length}` : "Перетащите файл(ы) в область выше"}
				</div>
			)}
		</div>
	));
}

export const Basic: Story = {
	render: createDropZoneStoryRender({ showStatus: true })
};

export const SingleFile: Story = {
	render: createDropZoneStoryRender({
		children: (
			<div style={{ display: "grid", placeItems: "center", gap: 6, minHeight: 120 }}>
				<UploadCloudIcon />
				<span>Перетащите один файл</span>
			</div>
		)
	}),
	args: {
		multiple: false
	}
};

export const Disabled: Story = {
	render: createDropZoneStoryRender(),
	args: {
		disabled: true,
		multiple: true
	}
};
