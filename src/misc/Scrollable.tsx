import { type ComponentPropsWithoutRef, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

export interface ScrollableProps extends ComponentPropsWithoutRef<"div"> {
	height?: string | number;
	stable?: boolean;
	overscroll?: boolean;
}

export function Scrollable({
	ref,
	children,
	height,
	stable,
	overscroll,
	className,
	style,
	...htmlProps
}: ScrollableProps & { ref?: Ref<HTMLDivElement> }) {
	return (
		<div
			{...htmlProps}
			ref={ref}
			className={cn("scrollable", stable && "stable", overscroll && "overscroll", className)}
			style={{ ...style, height: height ?? style?.height }}>
			{children}
		</div>
	);
}

export interface ScrollableBlockProps extends ScrollableProps {
	blockClassName?: string;
}

export function ScrollableBlock({ ref, blockClassName, ...props }: ScrollableBlockProps & { ref?: Ref<HTMLDivElement> }) {
	return (
		<div className={cn(blockClassName, "overflowHidden w100 h100")}>
			<Scrollable ref={ref} {...props} />
		</div>
	);
}
