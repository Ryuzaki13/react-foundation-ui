import { createElement, forwardRef, useMemo } from "react";

import { resolveProps, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { FlexContainerLayoutProps, FlexContainerProps } from "./types";
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
] as const satisfies readonly (keyof FlexContainerLayoutProps)[];

export const FlexContainer = forwardRef<HTMLElement, FlexContainerProps>(
	(
		{
			children,
			className = "",
			as,
			style,
			inline,
			row,
			column,
			rowReverse,
			columnReverse,
			wrap,
			nowrap,
			wrapReverse,
			align,
			justify,
			alignContent,
			gap,
			gapRow,
			gapColumn,
			...htmlProps
		},
		ref
	) => {
		const { activeBreakpoint } = useMatchMedia();

		const resolvedProps = useMemo(
			() =>
				resolveProps(
					{
						inline,
						row,
						column,
						rowReverse,
						columnReverse,
						wrap,
						nowrap,
						wrapReverse,
						align,
						justify,
						alignContent,
						gap,
						gapRow,
						gapColumn
					},
					activeBreakpoint,
					RESPONSIVE_KEYS
				),
			[
				activeBreakpoint,
				align,
				alignContent,
				column,
				columnReverse,
				gap,
				gapColumn,
				gapRow,
				inline,
				justify,
				nowrap,
				row,
				rowReverse,
				wrap,
				wrapReverse
			]
		);

		const flexClasses = useFlexContainerClasses(resolvedProps);

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

FlexContainer.displayName = "FlexContainer";
