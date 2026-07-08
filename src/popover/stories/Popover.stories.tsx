import { useState } from "react";

import { Placement } from "@floating-ui/react";

import { Button } from "../../button/Button";
import { Input } from "../../input/Input";
import { Popover } from "../components/Popover";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Popover> = {
	title: "Shared/UI/Popover",
	component: Popover,
	parameters: {
		atomicCanvas: true,
		layout: "centered"
	}
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	render: () => (
		<Popover>
			<Popover.Trigger>
				<button>Открыть</button>
			</Popover.Trigger>
			<Popover.Content>
				{(ctx) => (
					<div style={{ padding: 12, maxWidth: 160 }}>
						<p>Пример простого поповера</p>
						<button onClick={ctx.setClose}>Закрыть</button>
					</div>
				)}
			</Popover.Content>
		</Popover>
	)
};

export const Controlled: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<Popover open={open} onOpenChange={setOpen}>
				<Popover.Trigger>
					<button>{open ? "Закрыть" : "Открыть"}</button>
				</Popover.Trigger>
				<Popover.Content>
					<div style={{ padding: 12 }}>Контролируемый режим</div>
				</Popover.Content>
			</Popover>
		);
	}
};

export const AnchorPlacement: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
			{["top", "bottom", "left", "right", "top-start", "bottom-end"].map((pos) => (
				<Popover key={pos} placement={pos as Placement}>
					<Popover.Trigger>
						<button>{pos}</button>
					</Popover.Trigger>
					<Popover.Content>
						<div style={{ padding: 8 }}>{pos}</div>
					</Popover.Content>
				</Popover>
			))}
		</div>
	)
};

export const WithInteractiveContent: Story = {
	render: () => (
		<Popover>
			<Popover.Trigger>
				<button>Форма</button>
			</Popover.Trigger>
			<Popover.Content>
				{(ctx) => (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							ctx.setClose();
						}}
						style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, width: 180 }}>
						<Input label="Имя" placeholder="Введите имя" value={""} onChange={() => {}} />
						<Button>Отправить</Button>
					</form>
				)}
			</Popover.Content>
		</Popover>
	)
};
