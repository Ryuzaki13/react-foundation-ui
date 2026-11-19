import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "../../button";
import { type MediaViewerSlide } from "../model/imageViewerTypes";
import { MediaViewer } from "../ui/MediaViewer";

const sample = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const video = {
	kind: "video",
	src: sample,
	mimeType: "video/mp4",
	title: "Цветы",
	download: { url: sample, filename: "flower.mp4" }
} as const;

function Gallery({ slides }: { slides: readonly MediaViewerSlide[] }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Посмотреть</Button>
			<MediaViewer open={open} slides={slides} onClose={() => setOpen(false)} />
		</>
	);
}

const meta = { title: "UI/Image/MediaViewer", component: Gallery, args: { slides: [video] } } satisfies Meta<typeof Gallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Video: Story = {};
export const ImageAndVideo: Story = {
	args: { slides: [{ src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", alt: "Пейзаж" }, video] }
};
export const PlaybackError: Story = { args: { slides: [{ ...video, src: "data:video/mp4;base64,AA==" }] } };
