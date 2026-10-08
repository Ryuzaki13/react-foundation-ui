import { BellIcon, CheckIcon, DownloadIcon, PlusIcon } from "lucide-react";
import { useArgs } from "storybook/preview-api";

import { Button, type ButtonProps } from "../Button";

import { ButtonSchemeGrid } from "./ButtonSchemeGrid";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/Button",
	component: Button,
	args: {
		children: "Действие",
		tone: "neutral",
		appearance: "outline",
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
		tone: {
			description: "Цветовой тон для solid и outline. Если задан только tone, используется outline; ghost всегда нейтральный.",
			control: "inline-radio",
			options: ["neutral", "accent", "error", "warning", "success", "info"]
		},
		appearance: {
			description: "Для accent и статусов доступны solid и outline. Нейтральная кнопка имеет рамку или использует ghost.",
			control: "inline-radio",
			options: ["solid", "outline", "ghost"]
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
				<ButtonSchemeGrid />
			</section>

			<section style={{ display: "grid", gap: 12 }}>
				<h3 style={{ margin: 0 }}>Отключённое состояние</h3>
				<ButtonSchemeGrid disabled />
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
			<Button tone="neutral" appearance="outline">
				Нейтральная
			</Button>
			<Button tone="neutral" appearance="ghost">
				Нейтральная ghost
			</Button>
			<Button tone="accent" appearance="solid">
				Акцентная с заливкой
			</Button>
			<Button tone="accent" appearance="outline">
				Акцентная с контуром
			</Button>
			<Button tone="accent" appearance="ghost">
				Ghost остаётся нейтральной
			</Button>
			<Button tone="info" appearance="outline">
				Информация с контуром
			</Button>
			<Button tone="success" appearance="solid">
				Успех с заливкой
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
