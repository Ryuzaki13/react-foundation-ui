import { type Ref } from "react";

import { PolymorphicComponent } from "../polymorphic";

import { getGridContainerClasses, getGridContainerStyles } from "./getGridClasses";
import { GridContainerProps } from "./types";

export function GridContainer({
	ref,
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
}: GridContainerProps & { ref?: Ref<HTMLElement> }) {
	const gridClasses = getGridContainerClasses({
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
		variant
	});
	const gridStyles = getGridContainerStyles({ templateColumns, templateRows, autoColumns, autoRows, areas });

	const finalClassName = [gridClasses, gridStyles.className, className].filter(Boolean).join(" ");
	const finalStyle = { ...gridStyles.style, ...style };
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={finalStyle}>
			{children}
		</PolymorphicComponent>
	);
}

GridContainer.displayName = "GridContainer";
