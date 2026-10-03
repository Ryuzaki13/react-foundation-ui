import { Text } from "../../text";
import { List } from "../index";

import { usePaginatedListExample } from "./usePaginatedListExample";

/** Совместимый paged contract: данные добавляются локально; внешний backend этому примеру не нужен. */
export function PaginatedVirtualizedListExample() {
	const example = usePaginatedListExample();
	return (
		<div style={{ height: "24rem" }}>
			<List.VirtualizedContent
				items={example.items}
				getKey={(item) => item.id}
				render={(item) => (
					<Text as="p" className="paddingMd" data-list-demo-item={item.id}>
						{item.label}
					</Text>
				)}
				hasNextPage={example.hasNextPage}
				fetchNextPage={example.fetchNextPage}
				aria-label="Постраничный локальный список"
			/>
		</div>
	);
}
