import { type Ref } from "react";

import { MiddlewareData, Placement } from "@floating-ui/react";

import { FLOATING_ARROW_SIZE_PX } from "./floatingArrowGeometry";
import { getArrowStyle } from "./getArrowStyle";

const FLOATING_ARROW_BORDER_COLOR = "var(--floating-panel-border, var(--border-default))";
const FLOATING_ARROW_VIEW_BOX = `0 0 ${FLOATING_ARROW_SIZE_PX} ${FLOATING_ARROW_SIZE_PX}`;
const FLOATING_ARROW_POINTS = `${FLOATING_ARROW_SIZE_PX / 2},${FLOATING_ARROW_SIZE_PX / 2} ${FLOATING_ARROW_SIZE_PX},${FLOATING_ARROW_SIZE_PX} 0,${FLOATING_ARROW_SIZE_PX}`;

interface TooltipArrowProps {
	placement: Placement;
	middlewareData: MiddlewareData;
}

/** Цвета оболочки наследуются от поповера, чтобы стрелка сохраняла его фон и статусный контур. */
export function FloatingArrow({ ref, placement, middlewareData }: TooltipArrowProps & { ref?: Ref<HTMLDivElement> }) {
	return (
		<div ref={ref} style={getArrowStyle(placement, middlewareData)}>
			<svg
				width={FLOATING_ARROW_SIZE_PX}
				height={FLOATING_ARROW_SIZE_PX}
				viewBox={FLOATING_ARROW_VIEW_BOX}
				fill={FLOATING_ARROW_BORDER_COLOR}
				stroke={FLOATING_ARROW_BORDER_COLOR}
				strokeWidth="var(--border-width)"
				style={{ display: "block" }}>
				<polygon points={FLOATING_ARROW_POINTS} />
			</svg>
		</div>
	);
}
