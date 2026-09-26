import { type FloatingWindowPosition } from "../model/floatingWindowsTypes";

/**
 * Разводит совпавшие начальные позиции открытых окон по диагонали. Каждая
 * попытка проверяет следующий шаг каскада; число попыток ограничено числом
 * занятых позиций, поэтому даже плотная группа окон не создаёт бесконечный поиск.
 */
export function selectFloatingWindowCascadePosition(
	defaultPosition: FloatingWindowPosition,
	occupiedPositions: readonly FloatingWindowPosition[],
	cascadeOffset = 24
): FloatingWindowPosition {
	if (!Number.isFinite(cascadeOffset) || cascadeOffset < 0) {
		throw new RangeError("Смещение каскада должно быть конечным неотрицательным числом.");
	}

	for (const position of [defaultPosition, ...occupiedPositions]) {
		if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
			throw new RangeError("Координаты каскада плавающих окон должны быть конечными числами.");
		}
	}

	if (cascadeOffset === 0) return defaultPosition;

	let position = defaultPosition;

	for (let attempt = 0; attempt < occupiedPositions.length; attempt += 1) {
		const occupied = occupiedPositions.some((candidate) => candidate.x === position.x && candidate.y === position.y);
		if (!occupied) return position;

		const x = position.x + cascadeOffset;
		const y = position.y + cascadeOffset;
		if (!Number.isFinite(x) || !Number.isFinite(y)) {
			throw new RangeError("Координаты каскада вышли за пределы конечных чисел.");
		}
		position = { x, y };
	}

	return position;
}
