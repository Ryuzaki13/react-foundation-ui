import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { type ImageCropPoint } from "../model/imageCropTypes";
import { ImageCropper } from "../ui/ImageCropper";

const DEMO_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const meta = {
	title: "Shared/UI/Image/ImageCropper",
	component: ImageCropper,
	args: {
		image: DEMO_IMAGE,
		aspect: 16 / 9
	},
	parameters: {
		layout: "padded"
	},
	argTypes: {
		aspect: { control: "number" }
	}
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {};

export const Controlled: Story = {
	render: (args) => {
		const [crop, setCrop] = useState<ImageCropPoint>({ x: 0, y: 0 });
		const [zoom, setZoom] = useState(1);

		return <ImageCropper {...args} crop={crop} zoom={zoom} onCropChange={setCrop} onZoomChange={setZoom} />;
	}
};

export const Square: Story = {
	args: {
		aspect: 1
	}
};
