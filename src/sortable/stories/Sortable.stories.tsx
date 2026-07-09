import { useState, type CSSProperties } from "react";

import { Sortable } from "..";
import { getSortableReorderResult, type SortableLayout } from "../sortableUtils";

import type { UniqueIdentifier } from "@dnd-kit/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

const itemStyle: CSSProperties = {
	display: "grid",
	gridTemplateColumns: "var(--control-height) 1fr",
	alignItems: "center",
	gap: "var(--space-sm)",
	padding: "var(--space-sm)",
	border: "var(--border)",
	borderRadius: "var(--radius-sm)",
	background: "var(--surface-0)"
};

const verticalItems = ["Alpha", "Bravo", "Charlie", "Delta"];
const horizontalItems = ["Фильтры", "Графики", "Сводка", "История"];
const gridItems = ["Карточка 1", "Карточка 2", "Карточка 3", "Карточка 4", "Карточка 5", "Карточка 6"];

export interface SortablePreviewProps {
	containerId: string;
	layout: SortableLayout;
	initialItems: string[];
	itemWidth?: string;
	disabledIds?: string[];
}

function reorderItems(items: readonly UniqueIdentifier[], fromIndex: number, toIndex: number) {
	const next = [...items];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved!);
	return next;
}

function getContainerStyle(layout: SortableLayout): CSSProperties {
	switch (layout) {
		case "horizontal":
			return { display: "flex", gap: "var(--space-sm)", overflowX: "auto" };
		case "grid":
			return { display: "grid", gap: "var(--space-sm)", gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))" };
		case "vertical":
		default:
			return { display: "grid", gap: "var(--space-sm)" };
	}
}

export function SortablePreview(props: SortablePreviewProps) {
	const [items, setItems] = useState(props.initialItems);
	const disabledIdSet = new Set(props.disabledIds ?? []);

	return (
		<div style={{ display: "grid", gap: 12 }}>
			<Sortable.Root
				onDragEnd={(event) => {
					const reorder = getSortableReorderResult({
						event,
						items: {
							[props.containerId]: items
						}
					});
					if (!reorder) return;

					setItems((prev) => reorderItems(prev, reorder.fromIndex, reorder.toIndex) as string[]);
				}}>
				<Sortable.Container containerId={props.containerId} items={items} layout={props.layout}>
					<div style={getContainerStyle(props.layout)}>
						{items.map((item) => (
							<Sortable.Item
								key={item}
								id={item}
								disabled={disabledIdSet.has(item)}
								style={{
									...itemStyle,
									minWidth: props.itemWidth
								}}>
								<Sortable.DragHandle title={`Перетащить ${item}`} />
								<div>{item}</div>
							</Sortable.Item>
						))}
					</div>
				</Sortable.Container>
			</Sortable.Root>

			<div style={{ fontSize: 14, opacity: 0.8 }}>Порядок элементов изменяется локально в рамках story.</div>
		</div>
	);
}

const meta = {
	title: "Shared/UI/Sortable",
	component: SortablePreview,
	args: {
		containerId: "sortable-demo",
		layout: "vertical",
		initialItems: verticalItems,
		itemWidth: undefined,
		disabledIds: []
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		containerId: {
			description: "Идентификатор `SortableContext`, который используется для вычисления reorder внутри контейнера.",
			control: "text"
		},
		layout: {
			description: "Режим раскладки и стратегия сортировки: вертикальный список, горизонтальный список или grid.",
			control: "inline-radio",
			options: ["vertical", "horizontal", "grid"]
		},
		initialItems: {
			description: "Начальный набор элементов. Внутри story состояние управляется локально.",
			control: false
		},
		itemWidth: {
			description: "Минимальная ширина карточки; полезна для горизонтального режима.",
			control: "text"
		},
		disabledIds: {
			description: "Список id, для которых drag-handle отключен.",
			control: false
		}
	}
} satisfies Meta<typeof SortablePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const HorizontalList: Story = {
	args: {
		containerId: "sortable-horizontal",
		layout: "horizontal",
		initialItems: horizontalItems,
		itemWidth: "12rem"
	}
};

export const GridCards: Story = {
	args: {
		containerId: "sortable-grid",
		layout: "grid",
		initialItems: gridItems
	}
};

export const DisabledItems: Story = {
	args: {
		containerId: "sortable-disabled",
		layout: "vertical",
		initialItems: verticalItems,
		disabledIds: ["Bravo", "Delta"]
	}
};

export const HandleOnly: Story = {
	args: {
		containerId: "sortable-handle-only",
		layout: "vertical",
		initialItems: ["Пункт 1", "Пункт 2", "Пункт 3", "Пункт 4"]
	}
};

export const NestedContainers: Story = {
	args: {
		containerId: "top",
		layout: "vertical",
		initialItems: ["Группа A", "Группа B"]
	},
	render: () => {
		const [topItems, setTopItems] = useState(["Группа A", "Группа B"]);
		const [childItemsByGroup, setChildItemsByGroup] = useState<Record<string, string[]>>({
			"Группа A": ["A.1", "A.2", "A.3"],
			"Группа B": ["B.1", "B.2"]
		});

		return (
			<div style={{ display: "grid", gap: 12 }}>
				<Sortable.Root
					onDragEnd={(event) => {
						const reorder = getSortableReorderResult({
							event,
							items: {
								top: topItems,
								...Object.fromEntries(topItems.map((item) => [`parent:${item}`, childItemsByGroup[item] ?? []]))
							}
						});
						if (!reorder) return;

						if (reorder.containerId === "top") {
							setTopItems((prev) => reorderItems(prev, reorder.fromIndex, reorder.toIndex) as string[]);
							return;
						}

						const parentId = String(reorder.containerId).slice("parent:".length);
						setChildItemsByGroup((prev) => ({
							...prev,
							[parentId]: reorderItems(prev[parentId] ?? [], reorder.fromIndex, reorder.toIndex) as string[]
						}));
					}}>
					<Sortable.Container containerId="top" items={topItems}>
						<div style={{ display: "grid", gap: "var(--space-md)" }}>
							{topItems.map((groupId) => (
								<Sortable.Item
									key={groupId}
									id={groupId}
									style={{
										...itemStyle,
										gridTemplateColumns: "var(--control-height) 1fr",
										alignItems: "start"
									}}>
									<Sortable.DragHandle title={`Перетащить ${groupId}`} />
									<div style={{ display: "grid", gap: "var(--space-sm)" }}>
										<strong>{groupId}</strong>
										<Sortable.Container containerId={`parent:${groupId}`} items={childItemsByGroup[groupId] ?? []}>
											<div style={{ display: "grid", gap: "var(--space-xs)" }}>
												{(childItemsByGroup[groupId] ?? []).map((item) => (
													<Sortable.Item
														key={item}
														id={item}
														style={{
															...itemStyle,
															background: "var(--surface-1)"
														}}>
														<Sortable.DragHandle title={`Перетащить ${item}`} />
														<div>{item}</div>
													</Sortable.Item>
												))}
											</div>
										</Sortable.Container>
									</div>
								</Sortable.Item>
							))}
						</div>
					</Sortable.Container>
				</Sortable.Root>

				<div style={{ fontSize: 14, opacity: 0.8 }}>
					Вложенные контейнеры сортируются независимо и используют общий `Sortable.Root`.
				</div>
			</div>
		);
	}
};
