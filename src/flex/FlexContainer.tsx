import { createElement, forwardRef, useMemo } from "react";

import { resolveProps, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { FlexContainerProps } from "./types";
import { useFlexContainerClasses } from "./useFlexClasses";

const RESPONSIVE_KEYS = [
	"inline",
	"row",
	"column",
	"rowReverse",
	"columnReverse",
	"wrap",
	"nowrap",
	"wrapReverse",
	"align",
	"justify",
	"alignContent",
	"gap",
	"gapRow",
	"gapColumn"
] as const satisfies readonly (keyof Omit<FlexContainerProps, "children" | "className" | "as" | "style">)[];

export const FlexContainer = forwardRef<HTMLElement, FlexContainerProps>(({ children, className = "", as, style, ...props }, ref) => {
	const { activeBreakpoint } = useMatchMedia();

	const resolvedProps = useMemo(() => resolveProps(props, activeBreakpoint, RESPONSIVE_KEYS), [props, activeBreakpoint]);

	const flexClasses = useFlexContainerClasses(resolvedProps);

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

FlexContainer.displayName = "FlexContainer";
