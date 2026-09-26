import { clampNumberScaleValue } from "@ryuzaki13/react-foundation-lib/number-scale";

import { type FloatingWindowPosition, type FloatingWindowSize } from "../model/floatingWindowsTypes";

/**
 * Полностью удерживает измеренное окно внутри рабочей области. Пока одна из
 * сторон не измерена, сохраняет исходную позицию, включая её object identity.
 * Окно больше области привязывается к её левому верхнему углу по нужной оси.
 */
export function constrainFloatingWindowPosition(
	position: FloatingWindowPosition,
	size: FloatingWindowSize | null,
	bounds: FloatingWindowSize | null
): FloatingWindowPosition {
	if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
		throw new RangeError("Координаты плавающего окна должны быть конечными числами.");
	}

	for (const dimensions of [size, bounds]) {
		if (
			dimensions !== null &&
			(!Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height) || dimensions.width < 0 || dimensions.height < 0)
		) {
			throw new RangeError("Размер окна и рабочей области должен состоять из конечных неотрицательных чисел.");
		}
	}

	if (size === null || bounds === null || bounds.width === 0 || bounds.height === 0) {
		return position;
	}

	const x = clampNumberScaleValue(position.x, 0, Math.max(0, bounds.width - size.width));
	const y = clampNumberScaleValue(position.y, 0, Math.max(0, bounds.height - size.height));

	return x === position.x && y === position.y ? position : { x, y };
}
