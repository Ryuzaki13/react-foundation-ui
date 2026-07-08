import { MiddlewareData } from "@floating-ui/react";

export function getArrowStyle(placement: string, middlewareData?: MiddlewareData): React.CSSProperties {
	if (!middlewareData?.arrow) return {};

	const { x, y } = middlewareData.arrow;
	const place = placement.split("-")[0];

	const staticSide = {
		top: "bottom",
		right: "left",
		bottom: "top",
		left: "right"
	}[place] as keyof React.CSSProperties;

	const rotate = {
		top: "rotate(180deg)",
		right: "rotate(-90deg)",
		bottom: "rotate(0deg)",
		left: "rotate(90deg)"
	}[place] as keyof React.CSSProperties;

	return {
		pointerEvents: "none",
		position: "absolute",
		zIndex: -5,
		width: "16px",
		height: "16px",
		left: x != null ? `${x}px` : "",
		top: y != null ? `${y}px` : "",
		transform: rotate,
		[staticSide]: "-16px" // позиция стрелки в зависимости от стороны
	};
}
