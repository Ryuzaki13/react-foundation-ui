import type { CSSProperties } from "react";

import { StatusIndicator } from "../StatusIndicator";

import type { StatusIndicatorProps, StatusIndicatorSize, StatusIndicatorTone } from "../StatusIndicator";
import type { Meta, StoryObj } from "@storybook/react-vite";

const rowStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	gap: "var(--space-lg)"
};

const itemStyle: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: "var(--space-sm)"
};

const tones: readonly { tone: StatusIndicatorTone; label: string }[] = [
	{ tone: "neutral", label: "Неизвестно" },
	{ tone: "info", label: "В работе" },
	{ tone: "success", label: "Готово" },
	{ tone: "warning", label: "Требует внимания" },
	{ tone: "error", label: "Ошибка" }
];

const sizes: readonly { size: StatusIndicatorSize; label: string }[] = [
	{ size: "sm", label: "Small" },
	{ size: "md", label: "Medium" },
	{ size: "lg", label: "Large" }
];

const meta = {
	title: "UI/StatusIndicator",
	component: StatusIndicator,
	args: {
		tone: "info",
		size: "md",
		animated: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		tone: {
			description: "Семантический цвет индикатора.",
			control: "inline-radio",
			options: ["neutral", "info", "success", "warning", "error"]
		},
		size: {
			description: "Размер индикатора.",
			control: "inline-radio",
			options: ["sm", "md", "lg"]
		},
		animated: {
			description: "Включает спокойную пульсацию для изменяющегося или активного состояния.",
			control: "boolean"
		}
	}
} satisfies Meta<StatusIndicatorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: (args) => (
		<span style={itemStyle}>
			<StatusIndicator {...args} />
			<span>В работе</span>
		</span>
	)
};

export const Tones: Story = {
	render: () => (
		<div style={rowStyle}>
			{tones.map(({ tone, label }) => (
				<span key={tone} style={itemStyle}>
					<StatusIndicator tone={tone} />
					<span>{label}</span>
				</span>
			))}
		</div>
	)
};

export const Sizes: Story = {
	render: () => (
		<div style={rowStyle}>
			{sizes.map(({ size, label }) => (
				<span key={size} style={itemStyle}>
					<StatusIndicator size={size} tone="success" />
					<span>{label}</span>
				</span>
			))}
		</div>
	)
};

export const Animated: Story = {
	render: () => (
		<span style={itemStyle} role="status">
			<StatusIndicator tone="info" animated />
			<span>Синхронизация</span>
		</span>
	)
};
