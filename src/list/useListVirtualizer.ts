import { useLayoutEffect, useReducer, useState } from "react";

import { elementScroll, observeElementOffset, observeElementRect, Virtualizer, type VirtualizerOptions } from "@tanstack/react-virtual";
import { flushSync } from "react-dom";

type ListVirtualizerOptions = Pick<
	VirtualizerOptions<HTMLDivElement, HTMLElement>,
	"count" | "estimateSize" | "getScrollElement" | "measureElement" | "overscan"
>;

/**
 * Приватный React-adapter для списка поверх публичного TanStack Virtual core.
 *
 * `@tanstack/react-virtual#useVirtualizer` возвращает изменяемый объект с методами,
 * который React Compiler намеренно считает несовместимым с memoization. Этот hook
 * сохраняет тот же lifecycle, но изолирует imperative instance и отдаёт компоненту
 * только актуальный снимок после уведомлений virtualizer-а.
 */
export function useListVirtualizer(options: ListVirtualizerOptions) {
	"use no memo";

	const rerender = useReducer((revision: number) => revision + 1, 0)[1];
	const [instance] = useState(
		() =>
			new Virtualizer<HTMLDivElement, HTMLElement>({
				...options,
				observeElementRect,
				observeElementOffset,
				scrollToFn: elementScroll,
				onChange: (_instance, sync) => {
					if (sync) {
						flushSync(rerender);
						return;
					}

					rerender();
				}
			})
	);

	instance.setOptions({
		...options,
		observeElementRect,
		observeElementOffset,
		scrollToFn: elementScroll,
		onChange: (_instance, sync) => {
			if (sync) {
				flushSync(rerender);
				return;
			}

			rerender();
		}
	});

	/** Подключает и симметрично освобождает browser observers экземпляра. */
	useLayoutEffect(() => instance._didMount(), [instance]);

	/** После каждого commit синхронизирует scroll element и актуальные options. */
	useLayoutEffect(() => instance._willUpdate());

	return instance;
}
