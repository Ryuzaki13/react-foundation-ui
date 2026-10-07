import { getTextEditorCollapsedCaretRect } from "./getTextEditorCollapsedCaretRect";

/**
 * Встроенный редактор раскрывает каретку только в собственном scrollport.
 * scrollIntoView здесь недопустим: он прокручивает также host, modal и страницу.
 */
export function revealTextEditorCaretInEditable(root: HTMLElement): void {
	const document = root.ownerDocument;
	const selection = document.getSelection();
	if (
		document.activeElement !== root ||
		!selection?.isCollapsed ||
		selection.rangeCount === 0 ||
		!selection.anchorNode ||
		!root.contains(selection.anchorNode)
	)
		return;
	// Пока поле растёт без внутреннего overflow, раскрытие уже обеспечено
	// самой раскладкой. Не измеряем DOM Range на каждой короткой строке.
	if (root.clientHeight === 0 || root.scrollHeight <= root.clientHeight) return;

	const caret = getTextEditorCollapsedCaretRect(selection);
	if (!caret) return;

	const bounds = root.getBoundingClientRect();
	// Ошибочный WebKit rect выше начала самого содержимого не является
	// кареткой. scrollTop учитывается, чтобы разрешить реальные строки выше
	// текущего внутреннего viewport при навигации стрелками вверх.
	if (caret.bottom + root.scrollTop < bounds.top) return;
	const style = document.defaultView?.getComputedStyle(root);
	const top = bounds.top + root.clientTop + (Number.parseFloat(style?.paddingTop ?? "0") || 0);
	const bottom = bounds.top + root.clientTop + root.clientHeight - (Number.parseFloat(style?.paddingBottom ?? "0") || 0);
	const delta = caret.top < top ? caret.top - top : caret.bottom > bottom ? caret.bottom - bottom : 0;
	const target = Math.max(0, Math.min(root.scrollHeight - root.clientHeight, root.scrollTop + delta));
	if (Math.abs(target - root.scrollTop) > 1) root.scrollTop = target;
}
