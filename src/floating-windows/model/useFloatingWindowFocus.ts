import { type RefObject, useRef } from "react";

import { useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";

import { selectFloatingWindowRestoreFocus } from "../lib/selectFloatingWindowRestoreFocus";

/** Modeless-политика над общим focus lifecycle, без собственного focus trap или глобальных listeners. */
export function useFloatingWindowFocus(panelRef: RefObject<HTMLElement | null>): void {
	const attachedPanelRef = useRef<HTMLElement | null>(null);
	useOverlayFocus({
		active: true,
		trapFocus: false,
		containerRef: panelRef,
		initialFocus: (panel) => {
			// React StrictMode обнуляет DOM ref до effect cleanup, хотя focused node ещё подключён.
			// Идентичность реально получившей фокус панели нужна до завершения этого cleanup.
			attachedPanelRef.current = panel;
			return panel;
		},
		restoreFocusTarget: () => selectFloatingWindowRestoreFocus(attachedPanelRef.current)
	});
}
