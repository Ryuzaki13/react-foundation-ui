import { BellIcon, CheckIcon, DownloadIcon, PlusIcon } from "lucide-react";
import { useArgs } from "storybook/preview-api";

import { Button, type ButtonProps } from "../Button";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/Button",
	component: Button,
	args: {
		children: "Действие",
		variant: "neutralOutline",
		disabled: false,
		iconEnd: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
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
				"accent",
				"accentOutline",
				"brand",
				"error",
				"warning",
				"success",
				"info",
				"brandOutline",
				"errorOutline",
				"warningOutline",
				"successOutline",
				"infoOutline",
				"transparent"
			]
		},
		tone: {
			description: "Цветовой тон кнопки.",
			control: "inline-radio",
			options: ["neutral", "accent", "brand", "error", "warning", "success", "info"]
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
		type: {
			description: "Тип нативной кнопки; по умолчанию безопасный `button`.",
			control: "select",
			options: ["button", "submit", "reset"]
		},
		disabled: {
			description: "Блокирует нажатие.",
			control: "boolean"
		}
	}
} satisfies Meta<ButtonProps>;

export default meta;
type Story = StoryObj<ButtonProps>;

const variantExamples = [
	["neutral", "Neutral Solid"],
	["neutralOutline", "Neutral Outline"],
	["ghost", "Ghost"],
	["accent", "Accent Solid"],
	["accentOutline", "Accent Outline"],
	["brand", "Brand Solid"],
	["brandOutline", "Brand Outline"],
	["info", "Info Solid"],
	["success", "Success Solid"],
	["warning", "Warning Solid"],
	["error", "Error Solid"],
	["infoOutline", "Info Outline"],
	["successOutline", "Success Outline"],
	["warningOutline", "Warning Outline"],
	["errorOutline", "Error Outline"],
	["transparent", "Transparent"]
] as const satisfies ReadonlyArray<readonly [NonNullable<ButtonProps["variant"]>, string]>;

/**
 * Один набор данных гарантирует, что в Storybook обычные и disabled-кнопки
 * всегда содержат одинаковый полный набор готовых вариантов.
 */
function ButtonVariantGrid({ disabled = false }: { disabled?: boolean }) {
	return (
		<div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
			{variantExamples.map(([variant, label]) => (
				<Button key={variant} variant={variant} disabled={disabled}>
					{label}
				</Button>
			))}
		</div>
	);
}

export const Basic: Story = {
	render: function Render() {
		const [args] = useArgs<ButtonProps>();

		return <Button {...args} />;
	}
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
		<div style={{ display: "grid", gap: 24 }}>
			<section style={{ display: "grid", gap: 12 }}>
				<h3 style={{ margin: 0 }}>Обычное состояние</h3>
				<ButtonVariantGrid />
			</section>

			<section style={{ display: "grid", gap: 12 }}>
				<h3 style={{ margin: 0 }}>Отключённое состояние</h3>
				<ButtonVariantGrid disabled />
			</section>
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
			<Button tone="accent" appearance="solid">
				Accent Solid
			</Button>
			<Button tone="accent" appearance="outline">
				Accent Outline
			</Button>
			<Button tone="accent" appearance="ghost">
				Accent Ghost
			</Button>
			<Button tone="brand" appearance="solid">
				Brand Solid
			</Button>
			<Button tone="brand" appearance="outline">
				Brand Outline
			</Button>
			<Button tone="brand" appearance="ghost">
				Brand Ghost
			</Button>
			<Button tone="brand" appearance="transparent">
				Brand Transparent
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
