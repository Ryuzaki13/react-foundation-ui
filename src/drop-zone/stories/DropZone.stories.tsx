import { type ReactNode } from "react";

import { UploadCloudIcon } from "lucide-react";
import { fn } from "storybook/test";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { DropZone, type DropZoneProps } from "../DropZone";

import type { ReadFileAsDataUrlResult } from "@ryuzaki13/react-foundation-lib/file";
import type { Meta, StoryObj } from "@storybook/react-vite";

type DropZoneStoryProps = DropZoneProps & { readonly reading?: boolean };

const meta = {
	title: "UI/DropZone",
	component: DropZone,
	args: {
		value: [],
		onChange: fn<DropZoneProps["onChange"]>(),
		onChangeError: fn<NonNullable<DropZoneProps["onChangeError"]>>(),
		onReadingChange: fn<NonNullable<DropZoneProps["onReadingChange"]>>(),
		onClearError: fn<NonNullable<DropZoneProps["onClearError"]>>(),
		reading: false,
		multiple: true,
		readMode: "data-url",
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Подпись поля выбора файлов.",
			control: "text"
		},
		description: {
			description: "Ограничения и подсказка под подписью поля.",
			control: "text"
		},
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
		onReadingChange: {
			description: "Начало и завершение чтения группы, включая его отмену.",
			control: false
		},
		onClearError: {
			description: "Сбрасывает прежнюю ошибку при новом выборе.",
			control: false
		},
		reading: {
			control: false,
			table: { disable: true }
		},
		append: {
			description: "Добавляет новые файлы к value; по умолчанию новый выбор заменяет прежний.",
			control: "boolean"
		},
		error: {
			description: "Ошибка выбора или чтения файлов.",
			control: "text"
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
} satisfies Meta<DropZoneStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

function createDropZoneStoryRender({ showStatus = false, children }: { showStatus?: boolean; children?: ReactNode } = {}) {
	return createControlledStoryRender<DropZoneStoryProps>(({ reading, ...args }, updateArgs) => (
		<div style={{ display: "grid", gap: 12 }}>
			<DropZone
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
				onReadingChange={(next) => {
					args.onReadingChange?.(next);
					updateArgs({ reading: next });
				}}
				onChangeError={(error) => {
					args.onChangeError?.(error);
					updateArgs({
						error:
							error.code === "FILE_TOO_LARGE"
								? "Файл превышает допустимый размер. Выберите файл поменьше."
								: "Не удалось прочитать файл. Проверьте его тип и повторите выбор."
					});
				}}
				onClearError={() => {
					args.onClearError?.();
					updateArgs({ error: undefined });
				}}
				children={children ?? args.children}
			/>
			{showStatus && (
				<div role="status" style={{ fontSize: 14 }}>
					{reading
						? "Читаем выбранные файлы..."
						: args.value.length > 0
							? `Получено файлов: ${args.value.length}`
							: "Перетащите файлы в область выше"}
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

function createPreviousAttachment(): ReadFileAsDataUrlResult {
	const file = new File(["Методические рекомендации"], "recommendations.txt", { type: "text/plain", lastModified: 1704067200000 });
	return {
		mode: "data-url",
		file,
		meta: { name: file.name, mime: file.type, size: file.size, lastModified: file.lastModified },
		dataUrl: "data:text/plain;base64,ZGVtby1maWxl"
	};
}

export const AppendFiles: Story = {
	render: createDropZoneStoryRender({ showStatus: true }),
	args: {
		append: true,
		label: "Материалы занятия",
		description: "Новый выбор добавляется к списку. Текст, PDF и изображения, каждый файл до 1 МБ.",
		accept: [".txt", ".pdf", ".png", ".jpg"],
		allowedMime: ["text/plain", "application/pdf", "image/png", "image/jpeg"],
		maxBytes: 1024 * 1024,
		value: [createPreviousAttachment()]
	}
};

export const WithReadError: Story = {
	render: createDropZoneStoryRender({ showStatus: true }),
	args: {
		...AppendFiles.args,
		error: "Не удалось прочитать файл. Новый выбор сбросит эту ошибку."
	}
};

export const Disabled: Story = {
	render: createDropZoneStoryRender(),
	args: {
		disabled: true,
		multiple: true,
		value: [createPreviousAttachment()]
	}
};
