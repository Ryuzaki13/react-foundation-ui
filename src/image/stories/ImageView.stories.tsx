import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ImageView } from "../ui/ImageView";

const IMAGE_ID = "photo-1500530855697-b586d89ba3ee";
const buildDemoUrl = (width: number, format: "avif" | "webp" | "jpg") =>
	`https://images.unsplash.com/${IMAGE_ID}?auto=format&fit=crop&w=${width}&fm=${format}&q=80`;

const meta = {
	title: "Shared/UI/Image/ImageView",
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
	}
} satisfies Meta<typeof ImageView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsiveCandidates: Story = {};
