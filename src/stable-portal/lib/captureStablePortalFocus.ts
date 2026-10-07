import { type StablePortalFocusSnapshot } from "../model/stablePortalTransferTypes";

/** Range живой: сохраняем boundary nodes/offsets, чтобы удаление DOM-parent не схлопнуло сохранённый caret. */
export function captureStablePortalFocus(container: HTMLElement): StablePortalFocusSnapshot | null {
	const element = container.ownerDocument.activeElement;
	if (!(element instanceof HTMLElement) || !container.contains(element)) return null;
	const documentSelection = container.ownerDocument.getSelection();
	const ranges: StablePortalFocusSnapshot["ranges"] = Array.from({ length: documentSelection?.rangeCount ?? 0 }).flatMap((_, index) => {
		const range = documentSelection?.getRangeAt(index);
		return range && container.contains(range.startContainer) && container.contains(range.endContainer)
			? [{ start: range.startContainer, startOffset: range.startOffset, end: range.endContainer, endOffset: range.endOffset }]
			: [];
	});
	const inputSelection =
		(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) &&
		element.selectionStart !== null &&
		element.selectionEnd !== null
			? { start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection ?? "none" }
			: null;
	const selection =
		documentSelection?.anchorNode &&
		documentSelection.focusNode &&
		container.contains(documentSelection.anchorNode) &&
		container.contains(documentSelection.focusNode)
			? {
					anchor: documentSelection.anchorNode,
					anchorOffset: documentSelection.anchorOffset,
					focus: documentSelection.focusNode,
					focusOffset: documentSelection.focusOffset
				}
			: null;
	return { element, ranges, inputSelection, selection };
}
