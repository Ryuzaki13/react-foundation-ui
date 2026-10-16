import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ColumnsListExample } from "./ColumnsListExample";
import { GroupedColumnsVirtualizedListExample } from "./GroupedColumnsVirtualizedListExample";
import { InteractiveVirtualizedListExample } from "./InteractiveVirtualizedListExample";
import { PaginatedVirtualizedListExample } from "./PaginatedVirtualizedListExample";
import { VirtualizedListStateExample } from "./VirtualizedListStateExample";

const meta = {
	title: "Layout/List",
	component: InteractiveVirtualizedListExample,
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Compound-список с виртуальным DOM-окном, адаптивными колонками, необязательной группировкой и сохранением scroll anchor. Полный и постраничный источник используют один UI contract."
			}
		}
	}
} satisfies Meta<typeof InteractiveVirtualizedListExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullSource: Story = { name: "5000 элементов, поиск и перестановка", render: InteractiveVirtualizedListExample };
export const Columns: Story = { name: "Колонки без группировки", render: ColumnsListExample };
export const GroupedColumns: Story = { name: "5000 элементов, группы и колонки", render: GroupedColumnsVirtualizedListExample };
export const LegacyPagination: Story = { name: "Совместимая постраничная загрузка", render: PaginatedVirtualizedListExample };
export const Empty: Story = { name: "Пустой набор", render: () => <VirtualizedListStateExample /> };
export const InitialLoading: Story = { name: "Первичная загрузка", render: () => <VirtualizedListStateExample loading /> };
export const BackgroundLoading: Story = {
	name: "Фоновая загрузка не перекрывает строки",
	render: () => <VirtualizedListStateExample loading withItems />
};
