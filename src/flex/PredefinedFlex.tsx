import { type Ref } from "react";

import { FlexContainer } from "./FlexContainer";
import { PredefinedFlexProps } from "./types";
import { useFlexPredefinedClasses } from "./useFlexClasses";

export function PredefinedFlex({ ref, variant, children, className = "", ...props }: PredefinedFlexProps & { ref?: Ref<HTMLElement> }) {
	const predefinedClass = useFlexPredefinedClasses(variant ?? "");
	const finalClassName = [predefinedClass, className].filter(Boolean).join(" ");

	return (
		<FlexContainer ref={ref} className={finalClassName} {...props}>
			{children}
		</FlexContainer>
	);
}

PredefinedFlex.displayName = "PredefinedFlex";
