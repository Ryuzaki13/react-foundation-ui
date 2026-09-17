import { type Ref, useMemo } from "react";

import { resolveResponsiveValue, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { PolymorphicComponent } from "../polymorphic";

import { GridItemProps } from "./types";
import { useGridItemClasses, useGridItemStyles } from "./useGridClasses";

export function GridItem({
	ref,
	children,
	className = "",
	as,
	style,
	area,
	column,
	row,
	alignSelf,
	justifySelf,
	...htmlProps
}: GridItemProps & { ref?: Ref<HTMLElement> }) {
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
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={finalStyle}>
			{children}
		</PolymorphicComponent>
	);
}

GridItem.displayName = "GridItem";
