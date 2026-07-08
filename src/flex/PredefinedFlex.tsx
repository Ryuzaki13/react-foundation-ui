import { forwardRef } from "react";

import { FlexContainer } from "./FlexContainer";
import { PredefinedFlexProps } from "./types";
import { useFlexPredefinedClasses } from "./useFlexClasses";

export const PredefinedFlex = forwardRef<HTMLElement, PredefinedFlexProps>(({ variant, children, className = "", ...props }, ref) => {
	const predefinedClass = useFlexPredefinedClasses(variant ?? "");
	const finalClassName = [predefinedClass, className].filter(Boolean).join(" ");

	return (
		<FlexContainer ref={ref} className={finalClassName} {...props}>
			{children}
		</FlexContainer>
	);
});

PredefinedFlex.displayName = "PredefinedFlex";
