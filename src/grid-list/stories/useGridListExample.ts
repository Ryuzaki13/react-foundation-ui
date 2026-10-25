import { useCallback, useMemo, useState } from "react";

import { createGridListDemoItems, type GridListDemoItem, type GridListDemoMode } from "./gridListDemoSource";

/**
 * Локальные действия стенда не входят в GridList: поиск меняет identity набора,
 * а перестановка и обновление карточки сохраняют его scroll anchor.
 */
export function useGridListExample(mode: GridListDemoMode) {
	const paginated = mode === "paginated";
	const [source, setSource] = useState(() => ({ items: createGridListDemoItems(paginated ? 300 : 5000), nextId: 5000 }));
	const [search, setSearch] = useState("");
	const [pageSize, setPageSize] = useState(31);
	const [compact, setCompact] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [visibleKeys, setVisibleKeys] = useState<readonly string[]>([]);
	const [resetRevision, setResetRevision] = useState(0);
	const getKey = useCallback((item: GridListDemoItem) => item.id, []);
	const filtered = useMemo(() => {
		const query = search.trim().toLocaleLowerCase("ru");
		return query === "" ? source.items : source.items.filter((item) => item.label.toLocaleLowerCase("ru").includes(query));
	}, [search, source.items]);
	const items = useMemo(() => (paginated ? filtered.slice(0, pageSize) : filtered), [paginated, filtered, pageSize]);
	const changeSearch = useCallback((value: string) => {
		setSearch(value);
		setPageSize(31);
	}, []);
	const prepend = useCallback(() => {
		setSource((current) => ({
			items: [...createGridListDemoItems(1, current.nextId), ...current.items],
			nextId: current.nextId + 1
		}));
	}, []);
	const reverse = useCallback(() => {
		setSource((current) => ({ ...current, items: [...current.items].reverse() }));
	}, []);
	const growSelected = useCallback(() => {
		setSource((current) => ({
			...current,
			items: current.items.map((item, index) =>
				item.id === selectedId || (selectedId === null && index === 0)
					? { ...item, paragraphs: [...item.paragraphs, "Добавленные сведения изменяют высоту уже смонтированного ряда."] }
					: item
			)
		}));
	}, [selectedId]);
	const fetchNextPage = useCallback(async () => {
		setPageSize((current) => Math.min(current + 23, filtered.length));
	}, [filtered.length]);
	const toggleDensity = useCallback(() => setCompact((current) => !current), []);
	const toggleWidth = useCallback(() => setNarrow((current) => !current), []);
	const resetPosition = useCallback(() => setResetRevision((current) => current + 1), []);
	return {
		items,
		getKey,
		sourceCount: source.items.length,
		search,
		changeSearch,
		compact,
		narrow,
		selectedId,
		setSelectedId,
		visibleKeys,
		onVisibleKeysChange: setVisibleKeys,
		resetKey: `${search}:${resetRevision}`,
		hasNextPage: paginated && pageSize < filtered.length,
		fetchNextPage,
		prepend,
		reverse,
		growSelected,
		toggleDensity,
		toggleWidth,
		resetPosition
	};
}
