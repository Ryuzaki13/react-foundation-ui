import { createElement, forwardRef, useMemo } from "react";

import { resolveProps, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { FlexItemProps } from "./types";
import { useFlexItemClasses } from "./useFlexClasses";

const RESPONSIVE_KEYS = ["flex0", "flex1", "grow", "shrink", "basis", "alignSelf", "justifySelf"] as const satisfies readonly (keyof Omit<
	FlexItemProps,
	"children" | "className" | "as" | "style"
>)[];

export const FlexItem = forwardRef<HTMLElement, FlexItemProps>(({ children, className = "", as, style, ...props }, ref) => {
	const { activeBreakpoint } = useMatchMedia();

	const resolvedProps = useMemo(() => resolveProps(props, activeBreakpoint, RESPONSIVE_KEYS), [props, activeBreakpoint]);

	const flexClasses = useFlexItemClasses(resolvedProps);

	const finalClassName = [flexClasses, className].filter(Boolean).join(" ");
	const Component = as || "div";

	return createElement(
		Component,

		{
			ref,
			className: finalClassName,
			style
		},
		children
	);
});

FlexItem.displayName = "FlexItem";
