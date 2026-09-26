import { useEffect, type RefObject } from "react";

import { type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Измеряется фактический border box: проценты, rem и длинное содержимое не заменяются вымышленными 300×200. */
export function useFloatingWindowMeasurements(store: FloatingWindowsStore, id: string, ref: RefObject<HTMLElement | null>): void {
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const measure = () => {
			const width = element.offsetWidth;
			const height = element.offsetHeight;
			// Скрытая область не даёт usable geometry; её появление будет замечено тем же observer.
			if (width > 0 && height > 0) store.getState().setSize(id, { width, height });
		};
		measure();
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [store, id, ref]);
}
