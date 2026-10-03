import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";
import { Text } from "../../text";
import { List } from "../index";

import { useVirtualizedListExample } from "./useVirtualizedListExample";
import { VirtualizedListDemoRow } from "./VirtualizedListDemoRow";

/** Все 5000 элементов доступны в памяти: virtualization ограничивает только DOM, не данные и не запрос. */
export function InteractiveVirtualizedListExample() {
	const example = useVirtualizedListExample();
	return (
		<div style={{ height: "min(80dvh, 44rem)", minHeight: "24rem" }}>
			<List>
				<List.Toolbar>
					<FlexContainer wrap gap="sm" align="end">
						<InputText
							type="search"
							label="Поиск по локальному набору"
							value={example.search}
							onChange={example.setSearch}
							data-list-demo-action="search"
						/>
						<Button type="button" onClick={example.prepend} data-list-demo-action="prepend">
							Добавить в начало
						</Button>
						<Button type="button" onClick={example.reverse} data-list-demo-action="reverse">
							Обратить порядок
						</Button>
						<Button type="button" onClick={example.changeActivity} data-list-demo-action="activity">
							Изменить активность
						</Button>
						<Button type="button" onClick={example.resetPosition} data-list-demo-action="reset">
							К началу
						</Button>
					</FlexContainer>
				</List.Toolbar>
				<List.VirtualizedContent
					items={example.items}
					getKey={(item) => item.id}
					render={(item) => (
						<VirtualizedListDemoRow item={item} selected={item.id === example.selectedId} onSelect={example.setSelectedId} />
					)}
					estimateSize={220}
					overscan={5}
					resetKey={example.resetKey}
					emptyContent={<Text as="p">Поиск не нашёл элементов в локальном наборе.</Text>}
					aria-label="Большой локальный список"
					separated
				/>
				<List.Footer>
					<Text size="sm">
						Доступно {example.items.length} из {example.sourceCount}; выбран {example.selectedId ?? "ни один"}.
					</Text>
				</List.Footer>
			</List>
		</div>
	);
}
