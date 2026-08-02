import { useState, type ComponentProps } from "react";

import { useArgs } from "storybook/preview-api";

import { Badge } from "../Badge";
import { BadgeList } from "../BadgeList";

import type { Meta, StoryObj } from "@storybook/react-vite";

type BadgeStoryArgs = ComponentProps<typeof Badge>;

const meta = {
	title: "Shared/UI/Badge",
	component: Badge,
	args: {
		children: "Новый",
		size: "md",
		tone: "info",
		appearance: "solid"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		children: {
			description: "Текст внутри бейджа.",
			control: "text"
		},
		size: {
			description: "Размер бейджа.",
			control: "inline-radio",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		tone: {
			description: "Цветовой тон бейджа.",
			control: "inline-radio",
			options: ["neutral", "brand", "success", "warning", "error", "info"]
		},
		appearance: {
			description: "Форма бейджа.",
			control: "inline-radio",
			options: ["solid", "outline", "ghost", "transparent"]
		},
		onRemove: {
			description: "Показывает кнопку удаления и вызывает обработчик по клику.",
			control: false
		}
	}
} satisfies Meta<BadgeStoryArgs>;

export default meta;
type Story = StoryObj<BadgeStoryArgs>;

export const Basic: Story = {
	render: function Render() {
		const [args] = useArgs<BadgeStoryArgs>();

		return <Badge {...args} />;
	}
};

export const Tones: Story = {
	render: () => (
		<BadgeList>
			<Badge tone="neutral" appearance="outline">
				Neutral
			</Badge>
			<Badge tone="success" appearance="solid">
				Успешно
			</Badge>
			<Badge tone="warning" appearance="solid">
				Внимание
			</Badge>
			<Badge tone="error" appearance="solid">
				Ошибка
			</Badge>
			<Badge tone="info" appearance="solid">
				Информация
			</Badge>
		</BadgeList>
	)
};

export const Appearances: Story = {
	render: () => (
		<BadgeList>
			<Badge tone="neutral" appearance="solid">
				Solid
			</Badge>
			<Badge tone="neutral" appearance="outline">
				Outline
			</Badge>
			<Badge tone="info" appearance="ghost">
				Ghost
			</Badge>
			<Badge tone="warning" appearance="transparent">
				Transparent
			</Badge>
		</BadgeList>
	)
};

export const Sizes: Story = {
	render: () => (
		<BadgeList>
			<Badge size="xs">Extra Small</Badge>
			<Badge size="sm">Small</Badge>
			<Badge size="md">Medium</Badge>
			<Badge size="lg">Large</Badge>
			<Badge size="xl">Extra Large</Badge>
		</BadgeList>
	)
};

export const RemovableList: Story = {
	render: () => {
		const [items, setItems] = useState(["Фильтр A", "Фильтр B", "Фильтр C"]);

		return (
			<BadgeList>
				{items.map((item) => (
					<Badge key={item} tone="info" appearance="outline" onRemove={() => setItems((prev) => prev.filter((v) => v !== item))}>
						{item}
					</Badge>
				))}
			</BadgeList>
		);
	}
};
