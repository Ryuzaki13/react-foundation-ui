import { type Ref, type RefCallback, useCallback, useRef } from "react";

import { useMergeRefs } from "@floating-ui/react";

/**
 * Сохраняет React 19 cleanup дочернего якоря во всём поддерживаемом диапазоне
 * Floating UI: useMergeRefs в 0.27.0 игнорирует возвращённую callback-ref функцию.
 * Преобразуем только этот cleanup в обработку detach; object refs и объединение
 * reference по-прежнему принадлежат useMergeRefs.
 */
export function useFloatingPopoverAnchorRef(
	referenceRef: Ref<HTMLElement>,
	childRef: Ref<HTMLElement> | undefined
): RefCallback<HTMLElement> | null {
	const cleanupRef = useRef<(() => void) | undefined>(undefined);
	const callbackRef = useCallback(
		(node: HTMLElement | null): void => {
			if (typeof childRef !== "function") return;

			if (node === null) {
				const cleanup = cleanupRef.current;
				cleanupRef.current = undefined;
				if (cleanup) cleanup();
				else childRef(null);
				return;
			}

			const cleanup = childRef(node);
			cleanupRef.current = typeof cleanup === "function" ? cleanup : undefined;
		},
		[childRef]
	);

	return useMergeRefs([referenceRef, typeof childRef === "function" ? callbackRef : childRef]);
}
