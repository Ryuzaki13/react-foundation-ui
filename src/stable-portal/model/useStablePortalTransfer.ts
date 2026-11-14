import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

import { captureStablePortalFocus } from "../lib/captureStablePortalFocus";
import { moveStablePortalContainer } from "../lib/moveStablePortalContainer";

import { createStablePortalScrollTracking } from "./createStablePortalScrollTracking";
import { type StablePortalFocusSnapshot, type StablePortalTransfer } from "./stablePortalTransferTypes";

const STABLE_PORTAL_FOCUS_IN_EVENT = "focusin";
const STABLE_PORTAL_SELECTION_CHANGE_EVENT = "selectionchange";
const STABLE_PORTAL_SELECT_EVENT = "select";

/**
 * Запоминает только interaction boundary: host может быть удалён раньше transfer
 * layout-effect. Selection events не сканируют subtree и не снимают scroll snapshot.
 */
export function useStablePortalTransfer(container: HTMLElement | null): StablePortalTransfer {
	const snapshot = useRef<StablePortalFocusSnapshot | null>(null);
	const scrollTracking = useMemo(() => (container === null ? null : createStablePortalScrollTracking(container)), [container]);
	useLayoutEffect(() => {
		if (container === null) return;
		const stopScrollTracking = scrollTracking?.connect();
		const document = container.ownerDocument;
		const captureFocus = () => {
			snapshot.current = captureStablePortalFocus(container);
		};
		const captureSelection = () => {
			const current = captureStablePortalFocus(container);
			if (current !== null) snapshot.current = current;
		};
		document.addEventListener(STABLE_PORTAL_FOCUS_IN_EVENT, captureFocus);
		document.addEventListener(STABLE_PORTAL_SELECTION_CHANGE_EVENT, captureSelection);
		container.addEventListener(STABLE_PORTAL_SELECT_EVENT, captureSelection, true);
		return () => {
			stopScrollTracking?.();
			document.removeEventListener(STABLE_PORTAL_FOCUS_IN_EVENT, captureFocus);
			document.removeEventListener(STABLE_PORTAL_SELECTION_CHANGE_EVENT, captureSelection);
			container.removeEventListener(STABLE_PORTAL_SELECT_EVENT, captureSelection, true);
		};
	}, [container, scrollTracking]);
	return useCallback(
		(target) => {
			if (container === null || scrollTracking === null) return;
			snapshot.current = moveStablePortalContainer(container, target, snapshot.current, scrollTracking);
		},
		[container, scrollTracking]
	);
}
