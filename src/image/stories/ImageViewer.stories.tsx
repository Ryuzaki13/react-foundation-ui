import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "../../button";
import { type ImageViewerImage, type ImageViewerStyle } from "../model/imageViewerTypes";
import { ImageViewer } from "../ui/ImageViewer";

const IMAGE_IDS = ["photo-1500530855697-b586d89ba3ee", "photo-1441974231531-c6227db76b6e", "photo-1470252649378-9c29740c9fa8"];

/** Формирует responsive Unsplash URL только для изолированной Storybook-демонстрации. */
function buildDemoUrl(imageId: string, width: number, format: "avif" | "webp" | "jpg" = "webp") {
	return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=${width}&fm=${format}&q=80`;
}

const IMAGES: readonly ImageViewerImage[] = IMAGE_IDS.map((imageId, index) => ({
	src: buildDemoUrl(imageId, 1600),
	alt: `Природный пейзаж ${index + 1}`,
	title: `Изображение ${index + 1}`,
	description: "Responsive slide с миниатюрой, zoom, fullscreen и доступной русской навигацией.",
	thumbnail: buildDemoUrl(imageId, 240),
	intrinsicWidth: 1600,
	intrinsicHeight: 900,
	candidates: [640, 1280, 1600].map((width) => ({ src: buildDemoUrl(imageId, width), width })),
	sources: [
		{
			type: "image/avif",
			candidates: [640, 1280, 1600].map((width) => ({ src: buildDemoUrl(imageId, width, "avif"), width }))
		}
	],
	download: { url: buildDemoUrl(imageId, 2000, "jpg"), filename: `landscape-${index + 1}.jpg` }
}));

const CUSTOM_STYLE = {
	"--image-viewer-backdrop": "rgb(8 14 28 / 96%)",
	"--image-viewer-control-active-color": "#7dd3fc",
	"--image-viewer-thumbnail-active-border-color": "#7dd3fc",
	"--image-viewer-caption-background": "rgb(8 14 28 / 72%)"
} satisfies ImageViewerStyle;

const meta = {
	title: "Shared/UI/Image/ImageViewer",
	component: ImageViewer,
	args: {
		open: false,
		images: IMAGES,
		onClose: () => undefined
	},
	parameters: {
		layout: "centered"
	}
} satisfies Meta<typeof ImageViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsiveGallery: Story = {
	render: (args) => {
		const [open, setOpen] = useState(false);
		const [index, setIndex] = useState(0);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Открыть галерею</Button>
				<ImageViewer
					{...args}
					open={open}
					index={index}
					onClose={() => setOpen(false)}
					onIndexChange={setIndex}
					features={{ download: true }}
					style={CUSTOM_STYLE}
				/>
			</>
		);
	}
};

export const SingleImage: Story = {
	render: (args) => {
		const [open, setOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Открыть одно изображение</Button>
				<ImageViewer {...args} open={open} images={IMAGES.slice(0, 1)} onClose={() => setOpen(false)} />
			</>
		);
	}
};
