import { type Meta, type StoryObj } from "@storybook/react-vite";

import { StablePortal } from "../index";

import { StablePortalTransferExample } from "./StablePortalTransferExample";

const meta = {
	title: "Layout/StablePortal",
	component: StablePortal,
	args: { target: null, children: null },
	parameters: {
		layout: "fullscreen",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Перенос одного React subtree между подключёнными DOM-hosts. Черновики и effects остаются mounted; null скрывает содержимое без уничтожения. Полный контракт: src/stable-portal/README.md."
			}
		}
	}
} satisfies Meta<typeof StablePortal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TransferBetweenHosts: Story = {
	name: "Ячейка, плавающее окно и полный экран",
	render: StablePortalTransferExample
};
