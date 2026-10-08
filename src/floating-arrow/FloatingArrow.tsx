import { type Ref } from "react";

import { MiddlewareData, Placement } from "@floating-ui/react";

import { getArrowStyle } from "./getArrowStyle";

interface TooltipArrowProps {
	placement: Placement;
	middlewareData: MiddlewareData;
}

/** Цвета оболочки наследуются от поповера, чтобы стрелка сохраняла его фон и статусный контур. */
export function FloatingArrow({ ref, placement, middlewareData }: TooltipArrowProps & { ref?: Ref<HTMLDivElement> }) {
	return (
		<div ref={ref} style={getArrowStyle(placement, middlewareData)}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="var(--floating-panel-background, var(--bg-elevated))"
				stroke="var(--floating-panel-border, var(--border-default))"
				strokeWidth="var(--border-width)"
				style={{ display: "block" }}>
				<polygon points="8,8 16,16 0,16" />
			</svg>
		</div>
	);
}
