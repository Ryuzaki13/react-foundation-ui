import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";
import { Text } from "../../text";
import { List, type ListGrouping } from "../index";

import { type ListDemoItem } from "./listDemoTypes";
import { useVirtualizedListExample } from "./useVirtualizedListExample";
import { VirtualizedListDemoRow } from "./VirtualizedListDemoRow";

const grouping = {
	getKey: (item) =>
		item.paragraphs.length === 1 ? "Краткие записи" : item.paragraphs.length === 2 ? "Обычные записи" : "Подробные записи",
	render: (groupKey, groupItems) => (
		<Text as="h3" size="md" className="paddingSm">
			{groupKey}: {groupItems.length}
		</Text>
	)
} satisfies ListGrouping<ListDemoItem>;

/** Группы и измеряемые строки строит List: исходный массив и ключи по-прежнему принадлежат consumer-у. */
export function GroupedColumnsVirtualizedListExample() {
	const example = useVirtualizedListExample();
	return (
		<div style={{ height: "min(80dvh, 44rem)", minHeight: "24rem" }}>
			<List>
				<List.Toolbar>
					<FlexContainer wrap gap="sm" align="end">
						<InputText type="search" label="Поиск по записям" value={example.search} onChange={example.setSearch} />
						<Button type="button" onClick={example.prepend}>
							Добавить в начало
						</Button>
						<Button type="button" onClick={example.reverse}>
							Обратить порядок
						</Button>
					</FlexContainer>
				</List.Toolbar>
				<List.VirtualizedContent
					items={example.items}
					getKey={example.getKey}
					render={(item) => (
						<VirtualizedListDemoRow item={item} selected={item.id === example.selectedId} onSelect={example.setSelectedId} />
					)}
					columns={{ count: 3, minItemWidth: "16rem" }}
					grouping={grouping}
					estimateSize={280}
					overscan={3}
					resetKey={example.resetKey}
					onVisibleKeysChange={example.onVisibleKeysChange}
					emptyContent={<Text as="p">Поиск не нашёл записей.</Text>}
					aria-label="Записи по подробности в несколько колонок"
					separated
				/>
				<List.Footer>
					<Text size="sm">
						Доступно {example.items.length} записей; выбран {example.selectedId ?? "ни один"}. В видимых строках:{" "}
						{example.visibleKeys.length} записей. Заголовки групп в это число не входят.
					</Text>
				</List.Footer>
			</List>
		</div>
	);
}
