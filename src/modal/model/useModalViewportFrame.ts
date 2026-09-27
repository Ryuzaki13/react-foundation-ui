import { useEffect, useRef } from "react";

import { getOrCreatePortalRoot, useVisualViewportFrame } from "@ryuzaki13/react-foundation-lib/dom";

/** Все панели делят геометрию portal grid; lease сохраняет frame до закрытия последней панели. */
export function useModalViewportFrame(active: boolean): void {
	const containerRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (!active) return;
		containerRef.current = getOrCreatePortalRoot("modal-root");
		return () => {
			containerRef.current = null;
		};
	}, [active]);
	useVisualViewportFrame({ active, containerRef });
}
