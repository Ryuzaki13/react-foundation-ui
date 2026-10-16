import { useState } from "react";

import { Text } from "../../text";
import { List } from "../index";

import { createListDemoItems } from "./createListDemoItems";
import { VirtualizedListDemoRow } from "./VirtualizedListDemoRow";

const items = createListDemoItems(12);

/** Небольшой плоский источник не требует ни групп, ни предварительной сборки строк consumer-ом. */
export function ColumnsListExample() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	return (
		<div style={{ height: "min(80dvh, 40rem)", minHeight: "20rem" }}>
			<List>
				<List.Toolbar>
					<Text as="p">До трёх записей в строке; уменьшите ширину, чтобы увидеть перенос внутри строки.</Text>
				</List.Toolbar>
				<List.Content
					items={items}
					getKey={(item) => item.id}
					render={(item) => <VirtualizedListDemoRow item={item} selected={item.id === selectedId} onSelect={setSelectedId} />}
					columns={{ count: 3, minItemWidth: "16rem" }}
					separated
				/>
				<List.Footer>
					<Text size="sm">Группировка не задана; выбран {selectedId ?? "ни один"}.</Text>
				</List.Footer>
			</List>
		</div>
	);
}
