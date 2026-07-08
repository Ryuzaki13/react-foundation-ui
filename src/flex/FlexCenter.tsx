import React, { PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

interface FlexCenterProps extends PropsWithChildren {
	className?: string;
	minHeight?: string | number;
}

export const FlexCenter: React.FC<FlexCenterProps> = ({ className, minHeight, children }) => {
	return (
		<div className={cn("flexCenter h100", className)} style={{ minHeight }}>
			{children}
		</div>
	);
};
