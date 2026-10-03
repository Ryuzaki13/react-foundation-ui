import { useCallback, useMemo, useState } from "react";

import { createListDemoItems } from "./createListDemoItems";

/** Старый pagination consumer добавляет страницу из локального источника без пересоздания уже полученных DTO. */
export function usePaginatedListExample() {
	const [source] = useState(() => createListDemoItems(300));
	const [count, setCount] = useState(30);
	const items = useMemo(() => source.slice(0, count), [source, count]);
	const fetchNextPage = useCallback(async () => {
		setCount((current) => Math.min(current + 30, 300));
	}, []);
	return { items, hasNextPage: count < source.length, fetchNextPage };
}
