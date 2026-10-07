import { type PropsWithChildren } from "react";

/** Панель действий остаётся вне viewport, поэтому поиск не прокручивается вместе с элементами. */
export function ListToolbar({ children }: PropsWithChildren) {
	// Несколько controls остаются одной панелью: иначе второй элемент Toolbar
	// займёт minmax-строку viewport в родительском List.
	return <div>{children}</div>;
}
