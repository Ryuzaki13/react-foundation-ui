import { type Ref } from "react";

import { FlexContainer } from "./FlexContainer";
import { getFlexPredefinedClass } from "./getFlexClasses";
import { type PredefinedFlexProps } from "./types";

export function PredefinedFlex({ ref, variant, children, className = "", ...props }: PredefinedFlexProps & { ref?: Ref<HTMLElement> }) {
	const predefinedClass = getFlexPredefinedClass(variant ?? "");
	const finalClassName = [predefinedClass, className].filter(Boolean).join(" ");

	return (
		<FlexContainer ref={ref} className={finalClassName} {...props}>
			{children}
		</FlexContainer>
	);
}

PredefinedFlex.displayName = "PredefinedFlex";
