import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Button } from "../../button";
import { Dialog } from "../Dialog";

import type { Meta, StoryObj } from "@storybook/react-vite";

type DialogStoryArgs = React.ComponentProps<typeof Dialog>;

const meta = {
	title: "Shared/UI/Dialog",
	component: Dialog,
	args: {
		title: "Подтверждение операции",
		description: "Проверьте параметры перед выполнением действия.",
		open: false,
		onClose: fn(),
		minWidth: 360,
		children: null
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
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
			description: "Минимальная ширина контейнера окна в CSS-единицах или пикселях.",
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

function DialogStoryCanvas({ children }: { children: (close: () => void) => React.ReactNode }) {
	const [args, updateArgs] = useArgs<DialogStoryArgs>();
	const close = () => {
		args.onClose();
		updateArgs({ open: false });
	};

	return (
		<>
			<Button onClick={() => updateArgs({ open: true })}>Открыть диалог</Button>
			<Dialog {...args} open={args.open} onClose={close}>
				{args.children ?? children(close)}
			</Dialog>
		</>
	);
}

export const Controlled: Story = {
	render: () => (
		<DialogStoryCanvas
			children={(close) => (
				<div>
					<p>Подтвердите выполнение действия.</p>
					<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
						<Button variant="transparent" onClick={close}>
							Отмена
						</Button>
						<Button variant="success" onClick={close}>
							Подтвердить
						</Button>
					</div>
				</div>
			)}
		/>
	)
};

export const Opened: Story = {
	args: {
		open: true
	},
	render: () => <DialogStoryCanvas children={() => <div>Диалог изначально открыт для демонстрации верстки.</div>} />
};
