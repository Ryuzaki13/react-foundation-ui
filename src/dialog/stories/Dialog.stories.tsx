import { useState } from "react";

import { Button } from "../../button";
import { Dialog } from "../Dialog";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Dialog",
	component: Dialog,
	args: {
		title: "Подтверждение операции",
		description: "Проверьте параметры перед выполнением действия.",
		open: false,
		onClose: () => {},
		minWidth: 360,
		children: <div>Содержимое диалога</div>
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		title: {
			description: "Заголовок диалогового окна.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		open: {
			description: "Управляет видимостью диалога.",
			control: "boolean"
		},
		onClose: {
			description: "Вызывается при закрытии диалога.",
			control: false
		},
		minWidth: {
			description: "Минимальная ширина контейнера окна.",
			control: "text"
		},
		children: {
			description: "Контент внутри диалогового окна.",
			control: false
		}
	}
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	render: (args) => {
		const [open, setOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Открыть диалог</Button>
				<Dialog
					{...args}
					open={open}
					onClose={() => setOpen(false)}
					children={
						<div>
							<p>Подтвердите выполнение действия.</p>
							<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
								<Button variant="transparent" onClick={() => setOpen(false)}>
									Отмена
								</Button>
								<Button variant="success" onClick={() => setOpen(false)}>
									Подтвердить
								</Button>
							</div>
						</div>
					}
				/>
			</>
		);
	}
};

export const Opened: Story = {
	render: (args) => {
		const [open, setOpen] = useState(true);
		return (
			<Dialog
				{...args}
				open={open}
				onClose={() => setOpen(false)}
				children={<div>Диалог изначально открыт для демонстрации верстки.</div>}
			/>
		);
	},
	args: {
		open: true
	}
};
