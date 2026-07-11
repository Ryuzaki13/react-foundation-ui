import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ImageRenderer } from "../ui/ImageRenderer";

const DEMO_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const meta = {
	title: "Shared/UI/Image/ImageRenderer",
	component: ImageRenderer,
	args: {
		src: DEMO_IMAGE,
		alt: "Горный пейзаж"
	},
	parameters: {
		layout: "padded"
	},
	argTypes: {
		layout: {
			control: "inline-radio",
			options: ["cover", "contain", "intrinsic"]
		}
	}
} satisfies Meta<typeof ImageRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FixedCover: Story = {
	args: {
		layout: "cover",
		width: "min(100%, 48rem)",
		height: "24rem"
	}
};

export const FixedContain: Story = {
	args: {
		layout: "contain",
		width: "min(100%, 48rem)",
		height: "24rem",
		wrapperStyle: { background: "var(--surface-1)" }
	}
};

export const IntrinsicFullWidth: Story = {
	args: {
		layout: "intrinsic",
		intrinsicWidth: 1600,
		intrinsicHeight: 1067
	}
};
