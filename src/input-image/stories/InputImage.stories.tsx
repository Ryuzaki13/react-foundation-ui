import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { InputImage, type InputImageProps } from "../InputImage";

import type { ReadImageResult } from "@ryuzaki13/react-foundation-lib/file";
import type { Meta, StoryObj } from "@storybook/react-vite";

const createMockReadImageResult = (name: string = "avatar.png"): ReadImageResult => {
	const file = new File(["image-demo"], name, { type: "image/png", lastModified: 1704067200000 });

	return {
		mode: "data-url",
		meta: {
			name: file.name,
			mime: file.type,
			size: file.size,
			lastModified: file.lastModified
		},
		dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YxM9a0AAAAASUVORK5CYII=",
		file,
		dimensions: {
			width: 1,
			height: 1
		}
	};
};

const meta = {
	title: "Shared/UI/InputImage",
	component: InputImage,
	args: {
		value: undefined,
		onChange: fn<NonNullable<InputImageProps["onChange"]>>(),
		readMode: "data-url"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок поля выбора изображения.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст до выбора изображения.",
			control: "text"
		},
		value: {
			description: "Результат чтения выбранного изображения.",
			control: false
		},
		onChange: {
			description: "Вызывается после успешного чтения изображения.",
			control: false
		},
		onReadError: {
			description: "Вызывается при ошибке валидации или чтения изображения.",
			control: false
		},
		onClear: {
			description: "Очищает выбранное изображение.",
			control: false
		},
		allowedMime: {
			description: "Разрешенные MIME-типы изображений.",
			control: false
		},
		maxBytes: {
			description: "Максимальный размер изображения в байтах.",
			control: "number"
		},
		readMode: {
			description: "Режим чтения: data-url или array-buffer.",
			control: "inline-radio",
			options: ["data-url", "array-buffer"]
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Сброс ошибки при повторном выборе изображения.",
			control: false
		},
		disabled: {
			description: "Блокирует взаимодействие с полем.",
			control: "boolean"
		},
		size: {
			description: "Размер визуального контрола.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof InputImage>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderInputImageStory = createControlledStoryRender<InputImageProps>((args, updateArgs) => (
	<InputImage
		{...args}
		onChange={(value) => {
			args.onChange(value);
			updateArgs({ value });
		}}
		onClear={() => {
			args.onClear?.();
			updateArgs({ value: undefined });
		}}
		onClearError={() => {
			args.onClearError?.();
			updateArgs({ error: undefined });
		}}
	/>
));

export const Controlled: Story = {
	render: renderInputImageStory,
	args: {
		label: "Аватар",
		description: "Выберите одно изображение профиля.",
		placeholder: "Выберите изображение",
		readMode: "data-url",
		allowedMime: ["image/png", "image/jpeg", "image/webp"],
		value: undefined
	}
};

export const WithInitialImage: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<InputImageProps>();
		const value = args.value;

		return (
			<div style={{ display: "grid", gap: 12 }}>
				<InputImage
					{...args}
					onChange={(nextValue) => {
						args.onChange(nextValue);
						updateArgs({ value: nextValue });
					}}
					onClear={() => {
						args.onClear?.();
						updateArgs({ value: undefined });
					}}
					onClearError={() => {
						args.onClearError?.();
						updateArgs({ error: undefined });
					}}
				/>
				{value?.mode === "data-url" && (
					<img
						src={value.dataUrl}
						alt="Предпросмотр"
						style={{ width: 96, height: 96, objectFit: "cover", border: "1px solid var(--border-0)" }}
					/>
				)}
			</div>
		);
	},
	args: {
		label: "Изображение с предпросмотром",
		description: "Сторис показывает, что значение можно использовать для preview.",
		value: createMockReadImageResult()
	}
};

export const ArrayBufferMode: Story = {
	render: renderInputImageStory,
	args: {
		label: "Двоичный режим",
		description: "Используется, когда изображение нужно обработать как бинарные данные.",
		readMode: "array-buffer",
		value: undefined
	}
};
