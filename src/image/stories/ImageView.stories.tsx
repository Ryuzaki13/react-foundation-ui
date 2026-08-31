import { type Meta, type StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

import { ImageView, type ImageViewProps } from "../ui/ImageView";

const IMAGE_ID = "photo-1500530855697-b586d89ba3ee";
const buildDemoUrl = (width: number, format: "avif" | "webp" | "jpg") =>
	`https://images.unsplash.com/${IMAGE_ID}?auto=format&fit=crop&w=${width}&fm=${format}&q=80`;

const meta = {
	title: "UI/Image/ImageView",
	component: ImageView,
	args: {
		layout: "intrinsic",
		sizes: "(min-width: 64rem) 64rem, 100vw",
		image: {
			src: buildDemoUrl(1600, "jpg"),
			alt: "Responsive-пейзаж",
			intrinsicWidth: 1600,
			intrinsicHeight: 1067,
			candidates: [
				{ src: buildDemoUrl(640, "jpg"), width: 640 },
				{ src: buildDemoUrl(1280, "jpg"), width: 1280 },
				{ src: buildDemoUrl(1600, "jpg"), width: 1600 }
			],
			sources: [
				{
					type: "image/avif",
					candidates: [
						{ src: buildDemoUrl(640, "avif"), width: 640 },
						{ src: buildDemoUrl(1280, "avif"), width: 1280 },
						{ src: buildDemoUrl(1600, "avif"), width: 1600 }
					]
				},
				{
					type: "image/webp",
					candidates: [
						{ src: buildDemoUrl(640, "webp"), width: 640 },
						{ src: buildDemoUrl(1280, "webp"), width: 1280 },
						{ src: buildDemoUrl(1600, "webp"), width: 1600 }
					]
				}
			]
		}
	},
	parameters: {
		layout: "padded"
	},
	argTypes: {
		image: { description: "Исходные responsive-данные изображения.", control: false },
		alt: { description: "Явный альтернативный текст поверх image.alt.", control: "text" },
		sizes: { description: "Атрибут sizes для responsive-кандидатов.", control: "text" },
		layout: {
			description: "Режим расположения изображения внутри контейнера.",
			control: "inline-radio",
			options: ["cover", "contain", "intrinsic"]
		},
		role: { description: "Семантическая роль тега изображения.", control: "text" },
		ariaLabel: { description: "Явное доступное имя изображения.", control: "text" },
		caption: { description: "Подпись изображения в режиме figure.", control: "text" },
		fallback: { description: "Кастомный placeholder до загрузки.", control: false },
		useFigure: { description: "Оборачивает изображение в figure/figcaption.", control: "boolean" },
		aspectRatio: { description: "Соотношение сторон контейнера.", control: "text" },
		width: { description: "Ширина контейнера.", control: "text" },
		height: { description: "Высота контейнера.", control: "text" },
		wrapperStyle: { description: "Inline-стили контейнера изображения.", control: false }
	}
} satisfies Meta<typeof ImageView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsiveCandidates: Story = {
	render: function Render() {
		const [args] = useArgs<ImageViewProps>();

		return <ImageView {...args} />;
	}
};
