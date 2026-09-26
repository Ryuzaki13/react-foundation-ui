import { useEffect, useRef } from "react";

import { type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Одна область владеет своим containing block и одним observer; CSS-размер не копируется в React state. */
export function useFloatingWindowsBounds(store: FloatingWindowsStore) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const measure = () => {
			// Ноль — законная скрытая область, а не повод подменять client box внешним border box.
			store.getState().setBounds({ width: element.clientWidth, height: element.clientHeight });
		};
		measure();
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [store]);
	return ref;
}
