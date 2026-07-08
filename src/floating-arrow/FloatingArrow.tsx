import { forwardRef } from "react";

import { MiddlewareData, Placement } from "@floating-ui/react";

import { getArrowStyle } from "./getArrowStyle";

interface TooltipArrowProps {
	placement: Placement;
	middlewareData: MiddlewareData;
}

export const FloatingArrow = forwardRef<HTMLDivElement, TooltipArrowProps>(({ placement, middlewareData }, ref) => {
	return (
		<div ref={ref} style={getArrowStyle(placement, middlewareData)}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="var(--border-1)"
				stroke="var(--border-1)"
				strokeWidth="var(--border-width)"
				style={{ display: "block" }}>
				<polygon points="8,8 16,16 0,16" />
			</svg>
		</div>
	);
});
