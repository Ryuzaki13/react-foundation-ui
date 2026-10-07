import { useCallback, useLayoutEffect, useRef } from "react";

import { captureStablePortalFocus } from "../lib/captureStablePortalFocus";
import { moveStablePortalContainer } from "../lib/moveStablePortalContainer";

import { type StablePortalFocusSnapshot, type StablePortalTransfer } from "./stablePortalTransferTypes";

/**
 * Запоминает только interaction boundary: host может быть удалён раньше transfer
 * layout-effect. Selection events не сканируют subtree и не снимают scroll snapshot.
 */
export function useStablePortalTransfer(container: HTMLElement | null): StablePortalTransfer {
	const snapshot = useRef<StablePortalFocusSnapshot | null>(null);
	useLayoutEffect(() => {
		if (container === null) return;
		const document = container.ownerDocument;
		const captureFocus = () => {
			snapshot.current = captureStablePortalFocus(container);
		};
		const captureSelection = () => {
			const current = captureStablePortalFocus(container);
			if (current !== null) snapshot.current = current;
		};
		document.addEventListener("focusin", captureFocus);
		document.addEventListener("selectionchange", captureSelection);
		container.addEventListener("select", captureSelection, true);
		return () => {
			document.removeEventListener("focusin", captureFocus);
			document.removeEventListener("selectionchange", captureSelection);
			container.removeEventListener("select", captureSelection, true);
		};
	}, [container]);
	return useCallback(
		(target) => {
			if (container === null) return;
			snapshot.current = moveStablePortalContainer(container, target, snapshot.current);
		},
		[container]
	);
}
