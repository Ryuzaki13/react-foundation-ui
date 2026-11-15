import { type Meta, type StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, waitFor, within } from "storybook/test";

import { TabsModal, type TabsModalProps } from "..";
import { Button } from "../../button";
import { ModalManagerProvider } from "../../modal";

const meta = {
	title: "UI/Experimental/TabsModal",
	component: TabsModal,
	parameters: {
		atomicCanvas: true,
		layout: "centered",
		docs: {
			description: {
				component:
					"Экспериментальное модальное окно с горизонтальными вкладками. Крестик находится в строке вкладок, а `title` задаёт доступное имя окна. Содержимое прокручивается внутри активной вкладки; при переключении неактивное содержимое размонтируется."
			}
		}
	},
	decorators: [(story) => <ModalManagerProvider>{story()}</ModalManagerProvider>],
	args: {
		open: false,
		title: "Сведения о проекте",
		size: "md",
		onClose: fn(),
		children: [
			<TabsModal.Tab key="overview" id="overview" title="Обзор">
				<TabsModal.Content className="paddingMd">Сведения о проекте и его текущем состоянии.</TabsModal.Content>
			</TabsModal.Tab>,
			<TabsModal.Tab key="members" id="members" title="Участники">
				<TabsModal.Content className="paddingMd">Участники проекта и их роли.</TabsModal.Content>
			</TabsModal.Tab>,
			<TabsModal.Tab key="history" id="history" title="История">
				<TabsModal.Content className="paddingMd">Последние изменения в проекте.</TabsModal.Content>
			</TabsModal.Tab>
		]
	},
	argTypes: {
		children: { control: false },
		onClose: { control: false },
		onValueChange: { control: false }
	},
	render: function Render() {
		const [args, updateArgs] = useArgs<TabsModalProps>();

		return (
			<div id="app-root">
				<Button onClick={() => updateArgs({ open: true })}>Открыть окно с вкладками</Button>
				<TabsModal
					{...args}
					onClose={() => {
						args.onClose();
						updateArgs({ open: false });
					}}
				/>
			</div>
		);
	}
} satisfies Meta<typeof TabsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	name: "Обычное окно",
	play: async ({ canvas, canvasElement, userEvent }) => {
		// Окно рендерится в портале, поэтому его нет внутри story canvas.
		const body = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", { name: "Открыть окно с вкладками" });
		await userEvent.click(trigger);

		const dialog = within(await body.findByRole("dialog", { name: "Сведения о проекте" }));
		const tabList = within(dialog.getByRole("tablist"));
		const overview = tabList.getByRole("tab", { name: "Обзор" });
		const members = tabList.getByRole("tab", { name: "Участники" });
		const closeButton = dialog.getByRole("button", { name: "Закрыть модальное окно" });

		await waitFor(() => expect(closeButton).toHaveFocus());
		await userEvent.tab();
		await expect(overview).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(members).toHaveFocus();
		await expect(overview).toHaveAttribute("aria-selected", "true");
		await userEvent.keyboard("{Enter}");
		await expect(await dialog.findByText("Участники проекта и их роли.")).toBeVisible();

		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
		await waitFor(() => expect(trigger).toHaveFocus());
	}
};

const historyEntries = Array.from({ length: 48 }, (_, index) => `Изменение №${index + 1}`);
const extraTabs = [
	{ id: "participants", title: "Участники проекта" },
	{ id: "documents", title: "Документы проекта" },
	{ id: "notifications", title: "Настройки уведомлений" },
	{ id: "archive", title: "Архив изменений" }
];

export const Overflow: Story = {
	name: "Длинное содержимое и много вкладок",
	args: {
		title: "История проекта",
		height: "24rem",
		children: [
			<TabsModal.Tab key="history" id="history" title="История изменений">
				<TabsModal.Content className="paddingMd">
					<ol className="" style={{ paddingInlineStart: "var(--space-lg)" }}>
						{historyEntries.map((entry) => (
							<li key={entry}>{entry}</li>
						))}
					</ol>
				</TabsModal.Content>
			</TabsModal.Tab>,
			...extraTabs.map(({ id, title }) => (
				<TabsModal.Tab key={id} id={id} title={title}>
					<TabsModal.Content className="paddingMd">{title}.</TabsModal.Content>
				</TabsModal.Tab>
			))
		]
	}
};
