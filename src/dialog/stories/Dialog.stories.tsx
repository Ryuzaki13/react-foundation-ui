import { fn } from "storybook/test";

import { Button } from "../../button";
import { createControlledStoryRender, type StoryArgsUpdater } from "../../development/storybook/createControlledStoryRender";
import { Dialog } from "../Dialog";

import type { Meta, StoryObj } from "@storybook/react-vite";

type DialogStoryArgs = React.ComponentProps<typeof Dialog>;

const meta = {
	title: "UI/Dialog",
	component: Dialog,
	args: {
		title: "Подтверждение операции",
		description: "Проверьте параметры перед выполнением действия.",
		open: false,
		onClose: fn(),
		size: "sm",
		minWidth: undefined,
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
		size: {
			description: "Предустановленная ширина панели с теми же вариантами, что и у Modal.",
			control: "inline-radio",
			options: ["sm", "md", "lg", "xl", "xxl", "inside"]
		},
		minWidth: {
			description: "Дополнительная минимальная ширина панели; ограничивается выбранным size и доступной шириной viewport.",
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

function DialogStoryCanvas({
	args,
	updateArgs,
	children
}: {
	args: DialogStoryArgs;
	updateArgs: StoryArgsUpdater<DialogStoryArgs>;
	children: (close: () => void) => React.ReactNode;
}) {
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

function createDialogStoryRender(children: (close: () => void) => React.ReactNode) {
	return createControlledStoryRender<DialogStoryArgs>((args, updateArgs) => (
		<DialogStoryCanvas args={args} updateArgs={updateArgs} children={children} />
	));
}

export const Controlled: Story = {
	render: createDialogStoryRender((close) => (
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
	))
};

export const Opened: Story = {
	args: {
		open: true
	},
	render: createDialogStoryRender(() => <div>Диалог изначально открыт для демонстрации верстки.</div>)
};

export const LongContent: Story = {
	args: {
		open: true,
		size: "lg"
	},
	render: createDialogStoryRender((close) => (
		<div>
			{Array.from({ length: 24 }, (_, index) => (
				<p key={index}>
					Строка {index + 1}. Большой контент остаётся внутри доступной области экрана, а диалог прокручивается независимо от
					страницы.
				</p>
			))}
			<Button onClick={close}>Закрыть диалог</Button>
		</div>
	))
};

export const Sizes: Story = {
	args: {
		open: true,
		size: "sm"
	},
	render: createDialogStoryRender(() => <div>Измените size в Controls, чтобы сравнить ширину с одноимённым пресетом Modal.</div>)
};
