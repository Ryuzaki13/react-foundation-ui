import { type PropsWithChildren, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

interface ScrollableProps extends PropsWithChildren {
	className?: string;
	height?: string | number;
	stable?: boolean;
	overscroll?: boolean;
}

export function Scrollable({ ref, children, height, stable, overscroll, className }: ScrollableProps & { ref?: Ref<HTMLDivElement> }) {
	return (
		<div ref={ref} className={cn("scrollable", stable && "stable", overscroll && "overscroll", className)} style={{ height }}>
			{children}
		</div>
	);
}

interface ScrollableBlockProps extends ScrollableProps {
	blockClassName?: string;
}

export function ScrollableBlock({ ref, blockClassName, ...props }: ScrollableBlockProps & { ref?: Ref<HTMLDivElement> }) {
	return (
		<div className={cn(blockClassName, "overflowHidden w100 h100")}>
			<Scrollable ref={ref} {...props} />
		</div>
	);
}
