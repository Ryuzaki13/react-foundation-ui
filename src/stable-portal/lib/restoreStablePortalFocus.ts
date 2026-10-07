import { type StablePortalFocusSnapshot } from "../model/stablePortalTransferTypes";

import { getStablePortalBoundaryOffset } from "./getStablePortalBoundaryOffset";

/** Возвращает focus/caret только живому содержимому; стороннее portal selection не изменяет. */
export function restoreStablePortalFocus(container: HTMLElement, snapshot: StablePortalFocusSnapshot): void {
	const { element, inputSelection, ranges } = snapshot;
	if (!element.isConnected || !container.contains(element)) return;
	element.focus({ preventScroll: true });
	if (inputSelection !== null && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
		element.setSelectionRange(inputSelection.start, inputSelection.end, inputSelection.direction);
	}
	const selection = container.ownerDocument.getSelection();
	if (selection === null || ranges.length === 0) return;
	// Программное обновление редактора во время parking могло заменить text nodes.
	// В таком случае старая selection недействительна и не должна портить новую.
	if (ranges.some(({ start, end }) => !container.contains(start) || !container.contains(end))) return;
	const direction = snapshot.selection;
	if (ranges.length === 1 && direction !== null && container.contains(direction.anchor) && container.contains(direction.focus)) {
		// setBaseAndExtent сохраняет направление выделения, важное для Shift+Arrow
		// в contentEditable: обычный addRange превратил бы обратное выделение в прямое.
		selection.setBaseAndExtent(
			direction.anchor,
			getStablePortalBoundaryOffset(direction.anchor, direction.anchorOffset),
			direction.focus,
			getStablePortalBoundaryOffset(direction.focus, direction.focusOffset)
		);
		return;
	}
	selection.removeAllRanges();
	for (const { start, startOffset, end, endOffset } of ranges) {
		const range = container.ownerDocument.createRange();
		range.setStart(start, getStablePortalBoundaryOffset(start, startOffset));
		range.setEnd(end, getStablePortalBoundaryOffset(end, endOffset));
		selection.addRange(range);
	}
}
