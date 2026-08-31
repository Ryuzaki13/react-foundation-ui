import { type Meta, type StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

import { ImageRenderer, type ImageRendererProps } from "../ui/ImageRenderer";

const DEMO_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const meta = {
	title: "UI/Image/ImageRenderer",
	component: ImageRenderer,
	args: {
		src: DEMO_IMAGE,
		alt: "Горный пейзаж"
	},
	parameters: {
		layout: "padded"
	},
	argTypes: {
		src: { description: "URL основного изображения.", control: "text" },
		sources: { description: "Дополнительные responsive picture-источники.", control: false },
		layout: {
			description: "Режим расположения изображения внутри контейнера.",
			control: "inline-radio",
			options: ["cover", "contain", "intrinsic"]
		},
		alt: { description: "Альтернативный текст изображения.", control: "text" },
		role: { description: "Семантическая роль тега изображения.", control: "text" },
		ariaLabel: { description: "Явное доступное имя изображения.", control: "text" },
		caption: { description: "Подпись изображения в режиме figure.", control: "text" },
		fallback: { description: "Кастомный placeholder до загрузки.", control: false },
		useFigure: { description: "Оборачивает изображение в figure/figcaption.", control: "boolean" },
		aspectRatio: { description: "Соотношение сторон контейнера.", control: "text" },
		width: { description: "Ширина контейнера.", control: "text" },
		height: { description: "Высота контейнера.", control: "text" },
		intrinsicWidth: { description: "Исходная ширина изображения.", control: "number" },
		intrinsicHeight: { description: "Исходная высота изображения.", control: "number" },
		wrapperStyle: { description: "Inline-стили контейнера изображения.", control: false }
	}
} satisfies Meta<typeof ImageRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FixedCover: Story = {
	render: function Render() {
		const [args] = useArgs<ImageRendererProps>();

		return <ImageRenderer {...args} />;
	},
	args: {
		layout: "cover",
		width: "min(100%, 48rem)",
		height: "24rem"
	}
};

export const FixedContain: Story = {
	render: function Render() {
		const [args] = useArgs<ImageRendererProps>();

		return <ImageRenderer {...args} />;
	},
	args: {
		layout: "contain",
		width: "min(100%, 48rem)",
		height: "24rem",
		wrapperStyle: { background: "var(--surface-1)" }
	}
};

export const IntrinsicFullWidth: Story = {
	render: function Render() {
		const [args] = useArgs<ImageRendererProps>();

		return <ImageRenderer {...args} />;
	},
	args: {
		layout: "intrinsic",
		intrinsicWidth: 1600,
		intrinsicHeight: 1067
	}
};
