import { type Meta, type StoryObj } from "@storybook/react-vite";
import { Copy, Eye, PencilLine, Pin, Settings2, Trash2 } from "lucide-react";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { createControlledStoryRender, type StoryArgsUpdater } from "../../development/storybook/createControlledStoryRender";
import { ContextMenu, type ContextMenuProps } from "../components/ContextMenu";
import { DropdownMenu, type DropdownMenuProps } from "../components/DropdownMenu";
import { type MenuContentProps } from "../components/MenuContent";
import { type RadialMenuContentProps } from "../components/RadialMenuContent";

const placements = [
	"top",
	"top-start",
	"top-end",
	"right",
	"right-start",
	"right-end",
	"bottom",
	"bottom-start",
	"bottom-end",
	"left",
	"left-start",
	"left-end"
] as const;

type MenuContentStoryProps = Pick<MenuContentProps, "closeOnOutside" | "closeOnEscape" | "disableOutsideClick" | "restoreFocus">;
type RadialMenuContentStoryProps = Pick<RadialMenuContentProps, "radius" | "itemSize" | "closeLabel">;
type ContextMenuStoryArgs = ContextMenuProps & MenuContentStoryProps & RadialMenuContentStoryProps;
type DropdownMenuStoryArgs = DropdownMenuProps & MenuContentStoryProps;
type RadialContextMenuStoryArgs = ContextMenuStoryArgs;

const meta = {
	title: "Shared/UI/ContextMenu",
	component: ContextMenu,
	args: {
		children: null,
		placement: "right-start",
		open: false,
		defaultOpen: false,
		onOpenChange: fn<(open: boolean) => void>(),
		closeOnOutside: true,
		closeOnEscape: true,
		disableOutsideClick: false,
		restoreFocus: true
	},
	parameters: {
		atomicCanvas: true,
		layout: "centered"
	},
	argTypes: {
		children: {
			description: "Композиция из Trigger, Content и пунктов меню.",
			control: false
		},
		placement: {
			description: "Предпочтительное положение меню относительно trigger или точки вызова.",
			control: "select",
			options: placements
		},
		open: {
			description: "Контролируемая видимость меню.",
			control: "boolean"
		},
		defaultOpen: {
			description: "Начальная видимость в uncontrolled-режиме.",
			control: "boolean"
		},
		onOpenChange: {
			description: "Вызывается при открытии и закрытии меню.",
			control: false
		},
		closeOnOutside: {
			description: "Закрывает обычную панель по клику снаружи.",
			control: "boolean"
		},
		closeOnEscape: {
			description: "Закрывает обычную панель по клавише Escape.",
			control: "boolean"
		},
		disableOutsideClick: {
			description: "Игнорирует клики снаружи панели.",
			control: "boolean"
		},
		restoreFocus: {
			description: "Возвращает фокус на trigger после закрытия.",
			control: "boolean"
		},
		radius: {
			description: "Радиус кольца для радиального меню.",
			control: { type: "number", min: 0, step: 1 }
		},
		itemSize: {
			description: "Размер пункта радиального меню в пикселях.",
			control: { type: "number", min: 1, step: 1 }
		},
		closeLabel: {
			description: "Доступное имя и подпись центральной кнопки закрытия радиального меню.",
			control: "text"
		}
	}
} satisfies Meta<ContextMenuStoryArgs>;

export default meta;

type ContextStory = StoryObj<ContextMenuStoryArgs>;
type DropdownStory = StoryObj<DropdownMenuStoryArgs>;
type RadialContextStory = StoryObj<RadialContextMenuStoryArgs>;

function createMenuOpenChange<T extends { open?: boolean; onOpenChange?: (open: boolean) => void }>(
	args: T,
	updateArgs: StoryArgsUpdater<T>
) {
	return {
		args,
		onOpenChange: (open: boolean) => {
			args.onOpenChange?.(open);
			updateArgs({ open } as unknown as Partial<T>);
		}
	};
}

function DropdownMenuBasicCanvas({
	args,
	updateArgs
}: {
	args: DropdownMenuStoryArgs;
	updateArgs: StoryArgsUpdater<DropdownMenuStoryArgs>;
}) {
	const { onOpenChange } = createMenuOpenChange(args, updateArgs);

	return (
		<DropdownMenu placement={args.placement} open={args.open} defaultOpen={args.defaultOpen} onOpenChange={onOpenChange}>
			<DropdownMenu.Trigger>
				<button type="button">Действия</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				closeOnOutside={args.closeOnOutside}
				closeOnEscape={args.closeOnEscape}
				disableOutsideClick={args.disableOutsideClick}
				restoreFocus={args.restoreFocus}>
				<DropdownMenu.GroupLabel>Файл</DropdownMenu.GroupLabel>
				<DropdownMenu.Item icon={<PencilLine />} hotKey="Ctrl+E">
					Редактировать
				</DropdownMenu.Item>
				<DropdownMenu.Item icon={<Copy />} hotKey="Ctrl+C">
					Копировать
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item icon={<Trash2 />} hotKey="Del">
					Удалить
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}

function ContextMenuBasicCanvas({ args, updateArgs }: { args: ContextMenuStoryArgs; updateArgs: StoryArgsUpdater<ContextMenuStoryArgs> }) {
	const { onOpenChange } = createMenuOpenChange(args, updateArgs);

	return (
		<ContextMenu placement={args.placement} open={args.open} defaultOpen={args.defaultOpen} onOpenChange={onOpenChange}>
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
			<ContextMenu.Content
				closeOnOutside={args.closeOnOutside}
				closeOnEscape={args.closeOnEscape}
				disableOutsideClick={args.disableOutsideClick}
				restoreFocus={args.restoreFocus}>
				<ContextMenu.Item icon={<PencilLine size={14} />}>Переименовать</ContextMenu.Item>
				<ContextMenu.Item icon={<Copy size={14} />}>Дублировать</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item icon={<Trash2 size={14} />}>Переместить в корзину</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu>
	);
}

function ContextMenuRadialCanvas({
	args,
	updateArgs
}: {
	args: RadialContextMenuStoryArgs;
	updateArgs: StoryArgsUpdater<RadialContextMenuStoryArgs>;
}) {
	const { onOpenChange } = createMenuOpenChange(args, updateArgs);

	return (
		<ContextMenu placement={args.placement} open={args.open} defaultOpen={args.defaultOpen} onOpenChange={onOpenChange}>
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
			<ContextMenu.RadialContent
				closeOnOutside={args.closeOnOutside}
				closeOnEscape={args.closeOnEscape}
				disableOutsideClick={args.disableOutsideClick}
				restoreFocus={args.restoreFocus}
				radius={args.radius}
				itemSize={args.itemSize}
				closeLabel={args.closeLabel}>
				<ContextMenu.RadialItem icon={<PencilLine />}>Править</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Copy />}>Копия</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Pin />}>Закрепить</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Eye />}>Просмотр</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Settings2 />}>Опции</ContextMenu.RadialItem>
				<ContextMenu.RadialItem icon={<Trash2 />}>Удалить</ContextMenu.RadialItem>
			</ContextMenu.RadialContent>
		</ContextMenu>
	);
}

export const DropdownMenuBasic: DropdownStory = {
	name: "DropdownMenu / Базовый",
	args: {
		placement: "bottom-start"
	},
	render: createControlledStoryRender<DropdownMenuStoryArgs>((args, updateArgs) => (
		<DropdownMenuBasicCanvas args={args} updateArgs={updateArgs} />
	))
};

export const ContextMenuBasic: ContextStory = {
	name: "ContextMenu / По правому клику",
	render: createControlledStoryRender<ContextMenuStoryArgs>((args, updateArgs) => (
		<ContextMenuBasicCanvas args={args} updateArgs={updateArgs} />
	))
};

export const ContextMenuRadial: RadialContextStory = {
	name: "ContextMenu / Радиальное меню",
	args: {
		radius: 76,
		itemSize: 64,
		closeLabel: "Закрыть"
	},
	render: createControlledStoryRender<RadialContextMenuStoryArgs>((args, updateArgs) => (
		<ContextMenuRadialCanvas args={args} updateArgs={updateArgs} />
	))
};

export const ControlledDropdown: DropdownStory = {
	name: "DropdownMenu / Контролируемый",
	args: {
		placement: "bottom-start"
	},
	render: function Render() {
		const [args, updateArgs] = useArgs<DropdownMenuStoryArgs>();
		const { onOpenChange } = createMenuOpenChange(args, updateArgs);

		return (
			<DropdownMenu placement={args.placement} open={args.open} defaultOpen={args.defaultOpen} onOpenChange={onOpenChange}>
				<DropdownMenu.Trigger>
					<button type="button">{args.open ? "Скрыть меню" : "Показать меню"}</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					closeOnOutside={args.closeOnOutside}
					closeOnEscape={args.closeOnEscape}
					disableOutsideClick={args.disableOutsideClick}
					restoreFocus={args.restoreFocus}>
					<DropdownMenu.Item onSelect={() => onOpenChange(false)}>Закрыть</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>
		);
	}
};
