import { useLayoutEffect } from "react";

import { usePopoverContext } from "../../popover";

/**
 * Пропсы динамического anchor для единственного overflow-popover таблицы.
 */
type AnalyticalTableCellOverflowPopoverAnchorProps = Readonly<{
	anchor: HTMLElement;
}>;

/**
 * Привязывает общий `Popover` к DOM-элементу нажатого значения ячейки.
 *
 * Компонент не создаёт дополнительный DOM-узел вокруг текста: это сохраняет
 * корректный flex-shrink и ellipsis, а также позволяет переиспользовать один
 * floating-runtime для всех смонтированных строк таблицы.
 */
export function AnalyticalTableCellOverflowPopoverAnchor({ anchor }: AnalyticalTableCellOverflowPopoverAnchorProps) {
	const { refs } = usePopoverContext();

	useLayoutEffect(() => {
		refs.setReference(anchor);

		return () => {
			refs.setReference(null);
		};
	}, [anchor, refs]);

	return null;
}
