import { BellIcon, CheckIcon, DownloadIcon, PlusIcon } from "lucide-react";
import { fn } from "storybook/test";

import { Button } from "../Button";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Button",
	component: Button,
	args: {
		children: "Действие",
		variant: "neutralOutline",
		disabled: false,
		iconEnd: false,
		onClick: fn()
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		children: {
			description: "Текстовое содержимое кнопки.",
			control: "text"
		},
		variant: {
			description: "Готовая схема для обратной совместимости. Если заданы `tone` или `appearance`, они имеют приоритет.",
			control: "select",
			options: [
				"neutral",
				"neutralOutline",
				"ghost",
				"error",
				"warning",
				"success",
				"info",
				"errorOutline",
				"warningOutline",
				"successOutline",
				"infoOutline",
				"transparent"
			]
		},
		tone: {
			description: "Семантический тон кнопки.",
			control: "inline-radio",
			options: ["neutral", "error", "warning", "success", "info"]
		},
		appearance: {
			description: "Визуальная форма кнопки.",
			control: "inline-radio",
			options: ["solid", "outline", "ghost", "transparent"]
		},
		icon: {
			description: "Иконка слева или справа от текста.",
			control: false
		},
		iconEnd: {
			description: "Перемещает иконку в конец кнопки.",
			control: "boolean"
		},
		title: {
			description: "Текст тултипа и `aria-label` для кнопки.",
			control: "text"
		},
		disabled: {
			description: "Блокирует нажатие.",
			control: "boolean"
		},
		onClick: {
			description: "Вызывается при нажатии на кнопку.",
			control: false
		},
		className: {
			description: "Дополнительный CSS-класс.",
			control: "text"
		}
	}
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	// play: async function ({ args, canvas, userEvent }) {
	// 	const button = canvas.getByRole("button", { name: /button/i });
	// 	// 👇 Simulate behavior
	// 	await userEvent.click(button);
	// 	// 👇 Make assertions
	// 	await expect(button).toBeVisible();
	// 	await expect(args.onClick).not.toHaveBeenCalled();
	// }
};

export const Variants: Story = {
	render: () => (
		<div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
			<Button variant="neutral">Neutral Solid</Button>
			<Button variant="neutralOutline">Neutral Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="info">Info Solid</Button>
			<Button variant="success">Success Solid</Button>
			<Button variant="warning">Warning Solid</Button>
			<Button variant="error">Error Solid</Button>
			<Button variant="infoOutline">Info Outline</Button>
			<Button variant="successOutline">Success Outline</Button>
			<Button variant="warningOutline">Warning Outline</Button>
			<Button variant="errorOutline">Error Outline</Button>
			<Button variant="transparent">Transparent</Button>
		</div>
	),
	args: {
		children: "Действие"
	}
};

export const ComposableScheme: Story = {
	render: () => (
		<div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
			<Button tone="neutral" appearance="solid">
				Neutral Solid
			</Button>
			<Button tone="neutral" appearance="outline">
				Neutral Outline
			</Button>
			<Button tone="neutral" appearance="ghost">
				Neutral Ghost
			</Button>
			<Button tone="info" appearance="outline">
				Info Outline
			</Button>
			<Button tone="success" appearance="solid">
				Success Solid
			</Button>
			<Button tone="error" appearance="transparent">
				Error Transparent
			</Button>
		</div>
	)
};

export const WithIcons: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
			<Button icon={<DownloadIcon />}>Скачать</Button>
			<Button icon={<PlusIcon />} tone="info" appearance="solid">
				Создать
			</Button>
			<Button icon={<CheckIcon />} iconEnd tone="success" appearance="solid">
				Подтвердить
			</Button>
			<Button icon={<BellIcon />} title="Уведомления" />
		</div>
	),
	args: {
		children: "Действие"
	}
};
