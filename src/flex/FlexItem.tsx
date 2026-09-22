import { type Ref } from "react";

import { PolymorphicComponent } from "../polymorphic";

import { getFlexItemClasses } from "./getFlexClasses";
import { type FlexItemProps } from "./types";

export function FlexItem({
	ref,
	children,
	className = "",
	as,
	style,
	flex0,
	flex1,
	grow,
	shrink,
	basis,
	alignSelf,
	justifySelf,
	...htmlProps
}: FlexItemProps & { ref?: Ref<HTMLElement> }) {
	const flexClasses = getFlexItemClasses({ flex0, flex1, grow, shrink, basis, alignSelf, justifySelf });

	const finalClassName = [flexClasses, className].filter(Boolean).join(" ");
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={style}>
			{children}
		</PolymorphicComponent>
	);
}

FlexItem.displayName = "FlexItem";
