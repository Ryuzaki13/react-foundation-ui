import { type PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

export type GridListToolbarProps = PropsWithChildren & { readonly className?: string };

/** Панель вне прокрутки не сжимается при большом виртуальном источнике. */
export function GridListToolbar({ className, children }: GridListToolbarProps) {
	return <div className={cn("flex0", className)}>{children}</div>;
}
