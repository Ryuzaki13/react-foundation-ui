import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

export interface FlexCenterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	children?: ReactNode;
	minHeight?: string | number;
}

export const FlexCenter = ({ className, minHeight, children, style, ...htmlProps }: FlexCenterProps) => {
	const finalStyle = minHeight === undefined ? style : { ...style, minHeight };

	return (
		<div {...htmlProps} className={cn("flexCenter h100", className)} style={finalStyle}>
			{children}
		</div>
	);
};
