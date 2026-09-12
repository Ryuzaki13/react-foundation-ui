import { $createParagraphNode, $getNodeByKey, $getRoot, $isElementNode, $isTextNode, $setSelection, type RangeSelection } from "lexical";

/**
 * Восстанавливает место вставки, сохранённое до переноса фокуса в каталог.
 * Вызывается только внутри editor.update при подтверждении: открытие и отмена
 * не меняют документ/историю. Удалённый или отсутствующий диапазон означает
 * добавление в конец; пустому корню нужен абзац для корректной inline-ссылки.
 */
export function $restoreLinkDialogSelection(snapshot: RangeSelection | null): RangeSelection {
	if (
		snapshot &&
		[snapshot.anchor, snapshot.focus].every((point) => {
			const node = $getNodeByKey(point.key);
			if (!node?.isAttached() || point.offset < 0) return false;
			return point.type === "text"
				? $isTextNode(node) && point.offset <= node.getTextContentSize()
				: $isElementNode(node) && point.offset <= node.getChildrenSize();
		})
	) {
		const selection = snapshot.clone();
		$setSelection(selection);
		return selection;
	}
	const root = $getRoot();
	if (root.isEmpty()) root.append($createParagraphNode());
	return root.selectEnd();
}
