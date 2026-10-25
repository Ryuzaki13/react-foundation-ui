import { useLayoutEffect, useState, useSyncExternalStore } from "react";

import { type CollectionVirtualizerOptions, type CollectionVirtualizerResult } from "./collectionVirtualizerTypes";
import { createCollectionVirtualizerDriver } from "./createCollectionVirtualizerDriver";

/**
 * React-адаптер не читает DOM/ref во время render и не возвращает изменяемый core.
 * Внешние уведомления проходят через cached snapshot useSyncExternalStore;
 * layout lifecycle применяет актуальные ключи перед измерением строк.
 */
export function useCollectionVirtualizer<T>(options: CollectionVirtualizerOptions<T>): CollectionVirtualizerResult {
	const [driver] = useState(() => createCollectionVirtualizerDriver(options));
	const snapshot = useSyncExternalStore(driver.subscribe, driver.getSnapshot, driver.getServerSnapshot);

	useLayoutEffect(() => driver.mount(), [driver]);
	useLayoutEffect(() => driver.commit(options));

	return { ...snapshot, attachScrollElement: driver.attachScrollElement, measureElement: driver.measureElement };
}
