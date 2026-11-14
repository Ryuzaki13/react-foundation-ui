import { useEffect, useRef } from "react";

import { getOrCreatePortalRoot, useVisualViewportFrame } from "@ryuzaki13/react-foundation-lib/dom";

import { MODAL_PORTAL_ROOT_ID } from "../modalPortalConstants";

/** Все панели делят геометрию portal grid; lease сохраняет frame до закрытия последней панели. */
export function useModalViewportFrame(active: boolean): void {
	const containerRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (!active) return;
		containerRef.current = getOrCreatePortalRoot(MODAL_PORTAL_ROOT_ID);
		return () => {
			containerRef.current = null;
		};
	}, [active]);
	useVisualViewportFrame({ active, containerRef });
}
