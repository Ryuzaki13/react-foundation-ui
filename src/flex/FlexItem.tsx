import { createElement, forwardRef, useMemo } from "react";

import { resolveProps, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { FlexItemLayoutProps, FlexItemProps } from "./types";
import { useFlexItemClasses } from "./useFlexClasses";

const RESPONSIVE_KEYS = [
	"flex0",
	"flex1",
	"grow",
	"shrink",
	"basis",
	"alignSelf",
	"justifySelf"
] as const satisfies readonly (keyof FlexItemLayoutProps)[];

export const FlexItem = forwardRef<HTMLElement, FlexItemProps>(
	({ children, className = "", as, style, flex0, flex1, grow, shrink, basis, alignSelf, justifySelf, ...htmlProps }, ref) => {
		const { activeBreakpoint } = useMatchMedia();

		const resolvedProps = useMemo(
			() => resolveProps({ flex0, flex1, grow, shrink, basis, alignSelf, justifySelf }, activeBreakpoint, RESPONSIVE_KEYS),
			[activeBreakpoint, alignSelf, basis, flex0, flex1, grow, justifySelf, shrink]
		);

		const flexClasses = useFlexItemClasses(resolvedProps);

		const finalClassName = [flexClasses, className].filter(Boolean).join(" ");
		const Component = as || "div";

		return createElement(
			Component,

			{
				...htmlProps,
				ref,
				className: finalClassName,
				style
			},
			children
		);
	}
);

FlexItem.displayName = "FlexItem";
