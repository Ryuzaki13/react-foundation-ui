import { useLayoutEffect, useState, useSyncExternalStore } from "react";

import { createListVirtualizerDriver } from "./createListVirtualizerDriver";
import { type ListVirtualizerOptions, type ListVirtualizerResult } from "./listVirtualizerTypes";

/**
 * React-адаптер не читает DOM/ref во время render и не возвращает изменяемый core.
 * Внешние уведомления проходят через cached snapshot useSyncExternalStore;
 * layout lifecycle применяет актуальные ключи перед измерением строк.
 */
export function useListVirtualizer<T>(options: ListVirtualizerOptions<T>): ListVirtualizerResult {
	const [driver] = useState(() => createListVirtualizerDriver(options));
	const snapshot = useSyncExternalStore(driver.subscribe, driver.getSnapshot, driver.getServerSnapshot);

	useLayoutEffect(() => driver.mount(), [driver]);
	useLayoutEffect(() => driver.commit(options));

	return { ...snapshot, attachScrollElement: driver.attachScrollElement, measureElement: driver.measureElement };
}
