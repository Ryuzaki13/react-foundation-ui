import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ShimmerText, type ShimmerTextProps } from "../ShimmerText";

const meta = {
	title: "UI/ShimmerText",
	component: ShimmerText,
	args: {
		children: "Подготавливаем рабочую область"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		children: {
			description: "Короткий текст, по которому проходит световой блик.",
			control: "text"
		}
	}
} satisfies Meta<ShimmerTextProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const InContext: Story = {
	render: () => (
		<p style={{ color: "var(--content1)", margin: 0 }} role="status">
			<ShimmerText>Загружаем актуальные данные</ShimmerText>
		</p>
	)
};
