import { createElement, forwardRef, useMemo } from "react";

import { resolveResponsiveValue, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { GridContainerProps } from "./types";
import { useGridContainerClasses, useGridContainerStyles } from "./useGridClasses";

export const GridContainer = forwardRef<HTMLElement, GridContainerProps>(
	(
		{
			children,
			className = "",
			as,
			style,
			inline,
			row,
			column,
			dense,
			gap,
			gapRow,
			gapColumn,
			align,
			justify,
			alignContent,
			justifyContent,
			templateColumns,
			templateRows,
			autoColumns,
			autoRows,
			areas,
			variant,
			...htmlProps
		},
		ref
	) => {
		const { activeBreakpoint } = useMatchMedia();

		const resolved = useMemo(() => {
			return {
				inline: resolveResponsiveValue(inline, activeBreakpoint),

				row: resolveResponsiveValue(row, activeBreakpoint),
				column: resolveResponsiveValue(column, activeBreakpoint),
				dense: resolveResponsiveValue(dense, activeBreakpoint),

				gap: resolveResponsiveValue(gap, activeBreakpoint),
				gapRow: resolveResponsiveValue(gapRow, activeBreakpoint),
				gapColumn: resolveResponsiveValue(gapColumn, activeBreakpoint),

				align: resolveResponsiveValue(align, activeBreakpoint),
				justify: resolveResponsiveValue(justify, activeBreakpoint),
				alignContent: resolveResponsiveValue(alignContent, activeBreakpoint),
				justifyContent: resolveResponsiveValue(justifyContent, activeBreakpoint),

				variant: resolveResponsiveValue(variant, activeBreakpoint)
			};
		}, [activeBreakpoint, align, alignContent, column, dense, gap, gapColumn, gapRow, inline, justify, justifyContent, row, variant]);

		const resolvedStyles = useMemo(() => {
			return {
				templateColumns: resolveResponsiveValue(templateColumns, activeBreakpoint),
				templateRows: resolveResponsiveValue(templateRows, activeBreakpoint),
				autoColumns: resolveResponsiveValue(autoColumns, activeBreakpoint),
				autoRows: resolveResponsiveValue(autoRows, activeBreakpoint),
				areas: resolveResponsiveValue(areas, activeBreakpoint)
			};
		}, [activeBreakpoint, templateColumns, templateRows, autoColumns, autoRows, areas]);

		const gridClasses = useGridContainerClasses(resolved);
		const gridStyles = useGridContainerStyles(resolvedStyles);

		const finalClassName = [gridClasses, className].filter(Boolean).join(" ");
		const finalStyle = { ...gridStyles, ...style };
		const Component = as || "div";

		return createElement(
			Component,

			{
				...htmlProps,
				ref,
				className: finalClassName,
				style: finalStyle
			},
			children
		);
	}
);

GridContainer.displayName = "GridContainer";
