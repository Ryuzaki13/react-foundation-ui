import { useState } from "react";

import { type ListTestItem } from "./listTestItemTypes";

type ListStatefulTestRowProps = Readonly<{ item: ListTestItem }>;

/** Локальное состояние строки позволяет наблюдать React identity без чтения внутреннего кеша virtualizer. */
export function ListStatefulTestRow({ item }: ListStatefulTestRowProps) {
	const [count, setCount] = useState(0);
	return (
		<span data-list-test-item={item.id}>
			<button type="button" data-list-test-action={item.id} onClick={() => setCount((value) => value + 1)}>
				{count}
			</button>
		</span>
	);
}
