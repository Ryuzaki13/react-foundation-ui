/** Геометрия точки каретки, а не целого многострочного абзаца. */
export function getTextEditorCollapsedCaretRect(selection: Selection): DOMRect | null {
	const range = selection.getRangeAt(0);
	const caret = range.getBoundingClientRect();
	if (caret.height > 0) return caret;

	const anchor = selection.anchorNode;
	if (!anchor) return null;
	const offset = selection.anchorOffset;
	if (anchor.nodeType === Node.TEXT_NODE && anchor.textContent?.length) {
		// WebKit иногда возвращает нулевой rect collapsed Range. Соседний
		// символ того же text node измеряется clone Range, без смены selection.
		const probe = range.cloneRange();
		const start = Math.min(offset, anchor.textContent.length - 1);
		probe.setStart(anchor, start);
		probe.setEnd(anchor, start + 1);
		const rect = probe.getBoundingClientRect();
		return rect.height > 0 ? rect : null;
	}
	if (!(anchor instanceof HTMLElement)) return null;
	const adjacent = anchor.childNodes[offset] ?? anchor.childNodes[offset - 1];
	if (adjacent instanceof HTMLBRElement) {
		const rect = adjacent.getBoundingClientRect();
		if (rect.height > 0) return rect;
	}
	// Managed <br> пустого однострочного блока также может иметь нулевой rect.
	// Для непустого/многострочного блока такой fallback запрещён: его начало
	// не является текущей строкой и возвращало бы scrollTop к началу абзаца.
	if (!anchor.textContent && anchor.childNodes.length === 1 && adjacent instanceof HTMLBRElement) {
		const rect = anchor.getBoundingClientRect();
		return rect.height > 0 ? rect : null;
	}
	return null;
}
