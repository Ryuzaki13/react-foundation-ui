import { type CSSProperties } from "react";

import { type FloatingWindowSnapshot } from "../model/floatingWindowsTypes";

/** CSS ограничивает начальный SSR layout, затем измеренный размер уточняет те же границы. */
export function getFloatingWindowStyle(
	snapshot: FloatingWindowSnapshot,
	width: CSSProperties["width"],
	height: CSSProperties["height"]
): CSSProperties {
	const cssWidth = snapshot.size?.width ?? (typeof width === "number" ? width : null);
	const cssHeight = snapshot.size?.height ?? (typeof height === "number" ? height : null);
	return {
		width,
		height,
		zIndex: snapshot.layer,
		// Intrinsic/relative CSS-размер нельзя вычислять на сервере или вставлять как auto в calc.
		// До измерения такая ось начинается с безопасного origin, без недействительных CSS declarations.
		left: cssWidth === null ? 0 : `clamp(0px, ${snapshot.position.x}px, max(0px, calc(100% - ${cssWidth}px)))`,
		top: cssHeight === null ? 0 : `clamp(0px, ${snapshot.position.y}px, max(0px, calc(100% - ${cssHeight}px)))`
	};
}
