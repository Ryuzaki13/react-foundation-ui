import { Children, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Grid } from "../grid";

export interface ListToolbarProps {
	readonly children: ReactNode;
	readonly className?: string;
}

/** Панель действий остаётся вне viewport, поэтому поиск не прокручивается вместе с элементами. */
export function ListToolbar({ children, className }: ListToolbarProps) {
	if (Children.count(children) === 0) return <div />;
	return (
		<Grid.Container gap="sm" className={cn("paddingSm borderBottom", className)}>
			{children}
		</Grid.Container>
	);
}
