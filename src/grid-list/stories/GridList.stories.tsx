import { type Meta, type StoryObj } from "@storybook/react-vite";

import { GridListExample } from "./GridListExample";
import { GridListStateExample } from "./GridListStateExample";

const meta = {
	title: "Layout/GridList",
	component: GridListExample,
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Виртуализированная сетка с непрерывным адаптивным размещением всего источника, переменной высотой рядов и устойчивыми ключами карточек."
			}
		}
	}
} satisfies Meta<typeof GridListExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullSource: Story = { name: "5000 карточек, поиск и адаптивная плотность", render: () => <GridListExample /> };
export const Grouped: Story = { name: "Группы с заголовками на всю ширину", render: () => <GridListExample mode="grouped" /> };
export const Paginated: Story = { name: "Догрузка в непрерывную сетку", render: () => <GridListExample mode="paginated" /> };
export const Empty: Story = { name: "Пустой набор", render: () => <GridListStateExample state="empty" /> };
export const InitialLoading: Story = { name: "Первичная загрузка", render: () => <GridListStateExample state="loading" /> };
export const BackgroundLoading: Story = {
	name: "Фоновая загрузка сохраняет карточки",
	render: () => <GridListStateExample state="background" />
};
