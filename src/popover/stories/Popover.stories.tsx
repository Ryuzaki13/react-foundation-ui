import { useState } from "react";

import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Button } from "../../button/Button";
import { Input } from "../../input/Input";
import { Popover, type PopoverProps } from "../components/Popover";

import type { PopoverContentProps } from "../components/PopoverContent";
import type { PopoverTriggerProps } from "../components/PopoverTrigger";
import type { Placement } from "@floating-ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

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
] as const satisfies readonly Placement[];

type PopoverStoryArgs = PopoverProps &
	Pick<PopoverContentProps, "onClose" | "closeOnOutside" | "closeOnEscape" | "disableOutsideClick" | "background"> &
	Pick<PopoverTriggerProps, "passive">;

const meta = {
	title: "Shared/UI/Popover",
	component: Popover,
	args: {
		children: null,
		placement: "bottom",
		open: false,
		defaultOpen: false,
		onOpenChange: fn<(open: boolean) => void>(),
		onClose: fn(),
		closeOnOutside: true,
		closeOnEscape: true,
		disableOutsideClick: false,
		background: "secondary"
	},
	parameters: {
		atomicCanvas: true,
		layout: "centered"
	},
	argTypes: {
		children: {
			description: "Композиция из `Popover.Trigger` и `Popover.Content`.",
			control: false
		},
		placement: {
			description: "Предпочтительное положение панели относительно trigger.",
			control: "select",
			options: placements
		},
		open: {
			description: "Контролируемая видимость popover.",
			control: "boolean"
		},
		defaultOpen: {
			description: "Начальная видимость в uncontrolled-режиме.",
			control: "boolean"
		},
		onOpenChange: {
			description: "Вызывается при открытии и закрытии popover.",
			control: false
		},
		passive: {
			description: "Оставляет trigger пассивным: он получает reference, но не переключает popover по клику.",
			control: "boolean"
		},
		onClose: {
			description: "Вызывается после закрытия Content через Escape, клик снаружи или `setClose`.",
			control: false
		},
		closeOnOutside: {
			description: "Закрывает Content по клику снаружи.",
			control: "boolean"
		},
		closeOnEscape: {
			description: "Закрывает Content по клавише Escape.",
			control: "boolean"
		},
		disableOutsideClick: {
			description: "Игнорирует клики снаружи Content.",
			control: "boolean"
		},
		background: {
			description: "Тема фона Content.",
			control: "inline-radio",
			options: ["primary", "secondary"]
		}
	}
} satisfies Meta<PopoverStoryArgs>;

export default meta;
type Story = StoryObj<PopoverStoryArgs>;

interface PopoverStoryCanvasProps {
	trigger: (open: boolean) => PopoverTriggerProps["children"];
	children: PopoverContentProps["children"];
}

function PopoverStoryCanvas({ trigger, children }: PopoverStoryCanvasProps) {
	const [args, updateArgs] = useArgs<PopoverStoryArgs>();
	const onOpenChange = (open: boolean) => {
		args.onOpenChange?.(open);
		updateArgs({ open });
	};

	return (
		<Popover placement={args.placement} open={args.open} defaultOpen={args.defaultOpen} onOpenChange={onOpenChange}>
			<Popover.Trigger passive={args.passive}>{trigger(args.open === true)}</Popover.Trigger>
			<Popover.Content
				onClose={() => args.onClose?.()}
				closeOnOutside={args.closeOnOutside}
				closeOnEscape={args.closeOnEscape}
				disableOutsideClick={args.disableOutsideClick}
				background={args.background}>
				{children}
			</Popover.Content>
		</Popover>
	);
}

export const Default: Story = {
	render: () => (
		<PopoverStoryCanvas
			trigger={() => <button type="button">Открыть</button>}
			children={(ctx) => (
				<div style={{ padding: 12, maxWidth: 160 }}>
					<p>Пример простого поповера</p>
					<button type="button" onClick={ctx.setClose}>
						Закрыть
					</button>
				</div>
			)}
		/>
	)
};

export const Controlled: Story = {
	render: () => (
		<PopoverStoryCanvas
			trigger={(open) => <button type="button">{open ? "Закрыть" : "Открыть"}</button>}
			children={<div style={{ padding: 12 }}>Контролируемый режим</div>}
		/>
	)
};

export const AnchorPlacement: Story = {
	render: function Render() {
		const [args, updateArgs] = useArgs<PopoverStoryArgs>();
		const onOpenChange = (open: boolean, placement: Placement) => {
			args.onOpenChange?.(open);
			updateArgs(open ? { open: true, placement } : { open: false });
		};

		return (
			<div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
				{placements.map((placement) => (
					<Popover
						key={placement}
						placement={placement}
						open={args.open === true && args.placement === placement}
						defaultOpen={args.defaultOpen}
						onOpenChange={(open) => onOpenChange(open, placement)}>
						<Popover.Trigger passive={args.passive}>
							<button type="button">{placement}</button>
						</Popover.Trigger>
						<Popover.Content
							onClose={() => args.onClose?.()}
							closeOnOutside={args.closeOnOutside}
							closeOnEscape={args.closeOnEscape}
							disableOutsideClick={args.disableOutsideClick}
							background={args.background}>
							<div style={{ padding: 8 }}>{placement}</div>
						</Popover.Content>
					</Popover>
				))}
			</div>
		);
	}
};

export const WithInteractiveContent: Story = {
	render: function Render() {
		const [name, setName] = useState("");

		return (
			<PopoverStoryCanvas
				trigger={() => <button type="button">Форма</button>}
				children={(ctx) => (
					<form
						onSubmit={(event) => {
							event.preventDefault();
							ctx.setClose();
						}}
						style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, width: 180 }}>
						<Input label="Имя" placeholder="Введите имя" value={name} onChange={setName} />
						<Button>Отправить</Button>
					</form>
				)}
			/>
		);
	}
};
