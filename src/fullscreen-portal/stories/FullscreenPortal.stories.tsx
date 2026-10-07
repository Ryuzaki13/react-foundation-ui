import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "../../button";
import { Dialog } from "../../dialog";
import { FlexContainer } from "../../flex";
import { Input } from "../../input";
import { FullscreenPortal } from "../index";

const meta = {
	title: "Layout/FullscreenPortal",
	component: FullscreenPortal,
	parameters: { layout: "fullscreen" },
	argTypes: {
		escapeKey: { control: "boolean", description: "Встроенное закрытие поверхности по Escape; по умолчанию включено." }
	}
} satisfies Meta<typeof FullscreenPortal>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Полноэкранная поверхность и вложенный dialog используют общий document lock. */
export const KeyboardAndNestedDialog: Story = {
	args: { escapeKey: false },
	render: function Render(args) {
		const [open, setOpen] = useState(false);
		const [dialogOpen, setDialogOpen] = useState(false);
		return (
			<FlexContainer column gap="md" className="paddingMd">
				<Button onClick={() => setOpen(true)}>Открыть поверхность</Button>
				<p>
					На телефоне откройте клавиатуру, затем вложенный диалог. Фоновый документ не должен прокручиваться. При escapeKey=false
					Escape закрывает только вложенный диалог, поверхность закрывается кнопкой.
				</p>
				<FullscreenPortal
					open={open}
					title="Проверка клавиатуры"
					description="Вложенный диалог"
					escapeKey={args.escapeKey}
					onOpenChange={setOpen}>
					<FlexContainer column gap="md">
						<Input label="Текст" defaultValue="" />
						<Button onClick={() => setDialogOpen(true)}>Открыть диалог</Button>
						<Button onClick={() => setOpen(false)}>Закрыть поверхность</Button>
					</FlexContainer>
					<Dialog
						open={dialogOpen}
						title="Вложенный диалог"
						description="Закрытие не снимает блокировку поверхности"
						onClose={() => setDialogOpen(false)}>
						<Input label="Текст в диалоге" defaultValue="" />
						<Button onClick={() => setDialogOpen(false)}>Закрыть диалог</Button>
					</Dialog>
				</FullscreenPortal>
			</FlexContainer>
		);
	}
};
