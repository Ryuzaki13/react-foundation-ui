import { useCallback, useMemo, useState } from "react";

import { createListDemoItems } from "./createListDemoItems";
import { type ListDemoItem, type ListDemoSource } from "./listDemoTypes";

/** Локальный сценарий демонстрации: источник загружен один раз, поиск явно задаёт identity нового набора. */
export function useVirtualizedListExample() {
	const [source, setSource] = useState<ListDemoSource>(() => ({ items: createListDemoItems(5000), nextId: 5000 }));
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [resetRevision, setResetRevision] = useState(0);
	const [visibleKeys, setVisibleKeys] = useState<readonly string[]>([]);
	// Видимость меняет только footer: стабильный extractor не пересчитывает ключи полного источника при scroll.
	const getKey = useCallback((item: ListDemoItem) => item.id, []);
	const items = useMemo(() => {
		const query = search.trim().toLocaleLowerCase("ru");
		return query === "" ? source.items : source.items.filter((item) => item.label.toLocaleLowerCase("ru").includes(query));
	}, [search, source.items]);
	const prepend = useCallback(() => {
		setSource((current) => ({
			nextId: current.nextId + 1,
			items: [
				{
					id: `entry-${current.nextId}`,
					label: `Новая запись ${current.nextId + 1}`,
					activity: 0,
					paragraphs: ["Добавлена перед существующим набором без его сброса."]
				},
				...current.items
			]
		}));
	}, []);
	const reverse = useCallback(() => {
		setSource((current) => ({ ...current, items: [...current.items].reverse() }));
	}, []);
	const changeActivity = useCallback(() => {
		setSource((current) => ({
			...current,
			items: current.items.map((item, index) =>
				item.id === selectedId || (selectedId === null && index === 0) ? { ...item, activity: item.activity + 1 } : item
			)
		}));
	}, [selectedId]);
	const resetPosition = useCallback(() => setResetRevision((revision) => revision + 1), []);
	return {
		items,
		getKey,
		sourceCount: source.items.length,
		search,
		setSearch,
		resetKey: `${search}:${resetRevision}`,
		resetPosition,
		visibleKeys,
		onVisibleKeysChange: setVisibleKeys,
		selectedId,
		setSelectedId,
		prepend,
		reverse,
		changeActivity
	};
}
