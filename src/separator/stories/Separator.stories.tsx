import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Separator } from "../Separator";

const meta = {
	title: "UI/Separator",
	component: Separator,
	args: {
		orientation: "horizontal"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		orientation: {
			description: "Визуальное и семантическое направление разделителя.",
			control: "inline-radio",
			options: ["horizontal", "vertical"]
		}
	}
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Vertical: Story = {
	args: {
		orientation: "vertical"
	},
	render: (args) => (
		<div style={{ display: "flex", alignItems: "stretch", height: 48 }}>
			<span>Слева</span>
			<Separator {...args} />
			<span>Справа</span>
		</div>
	)
};
