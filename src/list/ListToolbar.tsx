import { type PropsWithChildren } from "react";

type ListToolbarProps = PropsWithChildren & Readonly<{ className?: string }>;

/** Панель действий остаётся вне viewport, поэтому поиск не прокручивается вместе с элементами. */
export function ListToolbar(props: ListToolbarProps) {
	// Несколько controls остаются одной панелью: иначе второй элемент Toolbar
	// займёт minmax-строку viewport в родительском List.
	return <div {...props} />;
}
