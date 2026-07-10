import { createElement, forwardRef, useMemo } from "react";

import { resolveResponsiveValue, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { GridItemProps } from "./types";
import { useGridItemClasses, useGridItemStyles } from "./useGridClasses";

export const GridItem = forwardRef<HTMLElement, GridItemProps>(
	({ children, className = "", as, style, area, column, row, alignSelf, justifySelf, ...htmlProps }, ref) => {
		const { activeBreakpoint } = useMatchMedia();

		const resolvedProps = useMemo(() => {
			return {
				alignSelf: resolveResponsiveValue(alignSelf, activeBreakpoint),
				justifySelf: resolveResponsiveValue(justifySelf, activeBreakpoint)
			};
		}, [activeBreakpoint, alignSelf, justifySelf]);

		const resolvedPlacement = useMemo(() => {
			return {
				area: resolveResponsiveValue(area, activeBreakpoint),
				column: resolveResponsiveValue(column, activeBreakpoint),
				row: resolveResponsiveValue(row, activeBreakpoint)
			};
		}, [activeBreakpoint, area, column, row]);

		const gridClasses = useGridItemClasses(resolvedProps);
		const gridStyles = useGridItemStyles(resolvedPlacement);

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

GridItem.displayName = "GridItem";
