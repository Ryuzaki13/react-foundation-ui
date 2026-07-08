import { useState } from "react";

import { Copy, Eye, PencilLine, Pin, Settings2, Trash2 } from "lucide-react";

import { ContextMenu } from "../components/ContextMenu";
import { DropdownMenu } from "../components/DropdownMenu";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/ContextMenu",
	parameters: {
		atomicCanvas: true,
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DropdownMenuBasic: Story = {
	name: "DropdownMenu / Базовый",
	render: () => (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<button type="button">Действия</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.GroupLabel>Файл</DropdownMenu.GroupLabel>
				<DropdownMenu.Item icon={<PencilLine size={14} />} hotKey="Ctrl+E">
					Редактировать
				</DropdownMenu.Item>
				<DropdownMenu.Item icon={<Copy size={14} />} hotKey="Ctrl+C">
					Копировать
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item icon={<Trash2 size={14} />} hotKey="Del">
					Удалить
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu>
	)
};

export const ContextMenuBasic: Story = {
	name: "ContextMenu / По правому клику",
	render: () => (
		<ContextMenu>
			<ContextMenu.Trigger>
				<div
					style={{
						width: 300,
						height: 180,
						display: "grid",
						placeItems: "center",
						border: "1px dashed var(--border-1)",
						borderRadius: "var(--radius-sm)",
						background: "var(--surface-1)",
						padding: 16,
						textAlign: "center"
					}}>
					Нажмите правой кнопкой мыши
					<br />
					или Shift+F10
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item icon={<PencilLine size={14} />}>Переименовать</ContextMenu.Item>
				<ContextMenu.Item icon={<Copy size={14} />}>Дублировать</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item icon={<Trash2 size={14} />}>Переместить в корзину</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu>
	)
};

export const ContextMenuRadial: Story = {
	name: "ContextMenu / Радиальное меню",
	render: () => (
		<ContextMenu>
			<ContextMenu.Trigger>
				<div
					style={{
						width: 360,
						height: 220,
						display: "grid",
						placeItems: "center",
						border: "1px dashed var(--border-1)",
						borderRadius: "var(--radius-sm)",
						background: "var(--surface-1)",
						padding: 16,
						textAlign: "center"
					}}>
					Нажмите правой кнопкой мыши
					<br />
					или Shift+F10
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.RadialContent>
				<ContextMenu.RadialItem icon={<PencilLine />}>Править</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Copy />}>Копия</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Pin />}>Закрепить</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Eye />}>Просмотр</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Settings2 />}>Опции</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Trash2 />}>Удалить</ContextMenu.RadialItem>
			</ContextMenu.RadialContent>
		</ContextMenu>
	)
};

export const ControlledDropdown: Story = {
	name: "DropdownMenu / Контролируемый",
	render: () => {
		const [open, setOpen] = useState(false);

		return (
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenu.Trigger>
					<button type="button">{open ? "Скрыть меню" : "Показать меню"}</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onSelect={() => setOpen(false)}>Закрыть</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>
		);
	}
};
