import { forwardRef, PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

interface ScrollableProps extends PropsWithChildren {
	className?: string;
	height?: string | number;
	stable?: boolean;
	overscroll?: boolean;
}

export const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(({ children, height, stable, overscroll, className }, ref) => {
	return (
		<div ref={ref} className={cn("scrollable", stable && "stable", overscroll && "overscroll", className)} style={{ height }}>
			{children}
		</div>
	);
});

interface ScrollableBlockProps extends ScrollableProps {
	blockClassName?: string;
}

export const ScrollableBlock = forwardRef<HTMLDivElement, ScrollableBlockProps>(({ blockClassName, ...props }, ref) => {
	return (
		<div className={cn(blockClassName, "overflowHidden w100 h100")}>
			<Scrollable ref={ref} {...props} />
		</div>
	);
});
