import { type Ref } from "react";

import { PolymorphicComponent } from "../polymorphic";

import { getGridItemClasses, getGridItemStyles } from "./getGridClasses";
import { GridItemProps } from "./types";

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
	const gridClasses = getGridItemClasses({ alignSelf, justifySelf });
	const gridStyles = getGridItemStyles({ area, column, row });

	const finalClassName = [gridClasses, gridStyles.className, className].filter(Boolean).join(" ");
	const finalStyle = { ...gridStyles.style, ...style };
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={finalStyle}>
			{children}
		</PolymorphicComponent>
	);
}

GridItem.displayName = "GridItem";
