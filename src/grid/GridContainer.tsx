import { createElement, forwardRef, useMemo } from "react";

import { resolveResponsiveValue, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { GridContainerProps } from "./types";
import { useGridContainerClasses, useGridContainerStyles } from "./useGridClasses";

export const GridContainer = forwardRef<HTMLElement, GridContainerProps>(
	({ children, className = "", as, style, templateColumns, templateRows, autoColumns, autoRows, areas, ...props }, ref) => {
		const { activeBreakpoint } = useMatchMedia();

		const resolved = useMemo(() => {
			return {
				...props,

				inline: resolveResponsiveValue(props.inline, activeBreakpoint),

				row: resolveResponsiveValue(props.row, activeBreakpoint),
				column: resolveResponsiveValue(props.column, activeBreakpoint),
				dense: resolveResponsiveValue(props.dense, activeBreakpoint),

				gap: resolveResponsiveValue(props.gap, activeBreakpoint),
				gapRow: resolveResponsiveValue(props.gapRow, activeBreakpoint),
				gapColumn: resolveResponsiveValue(props.gapColumn, activeBreakpoint),

				align: resolveResponsiveValue(props.align, activeBreakpoint),
				justify: resolveResponsiveValue(props.justify, activeBreakpoint),
				alignContent: resolveResponsiveValue(props.alignContent, activeBreakpoint),
				justifyContent: resolveResponsiveValue(props.justifyContent, activeBreakpoint),

				variant: resolveResponsiveValue(props.variant, activeBreakpoint)
			};
		}, [activeBreakpoint, props]);

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
			// eslint-disable-next-line react-hooks/refs
			{
				ref,
				className: finalClassName,
				style: finalStyle
			},
			children
		);
	}
);

GridContainer.displayName = "GridContainer";
