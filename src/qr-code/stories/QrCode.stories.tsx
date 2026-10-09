import { QrCode } from "../QrCode";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/QrCode",
	component: QrCode,
	args: {
		value: "https://example.org/",
		alt: "QR-код ссылки на пример сайта",
		size: 256,
		errorCorrectionLevel: "M"
	},
	parameters: { atomicCanvas: true, layout: "padded" },
	argTypes: {
		value: { description: "Строка для локального кодирования; примеры не содержат секретов.", control: "text" },
		alt: { description: "Доступное описание назначения QR.", control: "text" },
		size: { description: "Сторона квадрата в CSS px.", control: { type: "range", min: 128, max: 512, step: 16 } },
		errorCorrectionLevel: { control: "inline-radio", options: ["L", "M", "Q", "H"] },
		onError: { control: false }
	}
} satisfies Meta<typeof QrCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
export const LongValue: Story = {
	args: { value: `https://example.org/confirm#${"synthetic-".repeat(20)}`, alt: "QR-код длинной синтетической ссылки" }
};
export const EmptyValue: Story = { args: { value: "" } };
export const NarrowContainer: Story = {
	render: (args) => (
		<div style={{ width: 160 }}>
			<QrCode {...args} />
		</div>
	)
};
