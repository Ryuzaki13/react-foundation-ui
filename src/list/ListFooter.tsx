import { Children, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Grid } from "../grid";

export interface ListFooterProps {
	readonly children: ReactNode;
	readonly className?: string;
}

/** Дополнительные действия не становятся виртуальными строками и не меняют их измерения. */
export function ListFooter({ children, className }: ListFooterProps) {
	if (Children.count(children) === 0) return <div />;
	return (
		<Grid.Container gap="sm" className={cn("paddingSm borderTop", className)}>
			{children}
		</Grid.Container>
	);
}
