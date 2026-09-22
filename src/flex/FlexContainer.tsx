import { type Ref } from "react";

import { PolymorphicComponent } from "../polymorphic";

import { getFlexContainerClasses } from "./getFlexClasses";
import { type FlexContainerProps } from "./types";

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
	const flexClasses = getFlexContainerClasses({
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
	});

	const finalClassName = [flexClasses, className].filter(Boolean).join(" ");
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={style}>
			{children}
		</PolymorphicComponent>
	);
}

FlexContainer.displayName = "FlexContainer";
