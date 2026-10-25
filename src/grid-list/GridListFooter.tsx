import { type PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

export type GridListFooterProps = PropsWithChildren & { readonly className?: string };

/** Итоги и внешние действия не входят в измеряемые ряды сетки. */
export function GridListFooter({ className, children }: GridListFooterProps) {
	return <div className={cn("flex0", className)}>{children}</div>;
}
