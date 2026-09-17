import { type Ref, useMemo } from "react";

import { resolveProps, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { PolymorphicComponent } from "../polymorphic";

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

export function FlexContainer({
	ref,
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
}: FlexContainerProps & { ref?: Ref<HTMLElement> }) {
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
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={style}>
			{children}
		</PolymorphicComponent>
	);
}

FlexContainer.displayName = "FlexContainer";
