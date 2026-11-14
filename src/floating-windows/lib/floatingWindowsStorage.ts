import { isRecord } from "@ryuzaki13/react-foundation-lib/validators";

import { type FloatingWindowPosition } from "../model/floatingWindowsTypes";

import { isFloatingWindowId } from "./isFloatingWindowId";

const POSITIONS_STORAGE_VERSION = 1;
const POSITIONS_STORAGE_MAX_POSITIONS = 200;
const POSITIONS_STORAGE_MAX_TEXT_LENGTH = 64 * 1024;
const INVALID_STORED_POSITION_MESSAGE = "Сохранённая позиция окна не прошла проверку.";

/** Неавторитетный cache не мигрируется: неизвестная версия/форма отклоняется целиком и не попадает в геометрию. */
export function readFloatingWindowsPositions(text: string): ReadonlyMap<string, FloatingWindowPosition> {
	if (text.length > POSITIONS_STORAGE_MAX_TEXT_LENGTH) throw new Error("Сохранённые позиции окон превышают допустимый размер.");
	const value: unknown = JSON.parse(text);
	if (
		!isRecord(value) ||
		value.version !== POSITIONS_STORAGE_VERSION ||
		!Array.isArray(value.positions) ||
		value.positions.length > POSITIONS_STORAGE_MAX_POSITIONS
	) {
		throw new Error("Неизвестный формат сохранённых позиций окон.");
	}
	const positions = new Map<string, FloatingWindowPosition>();
	for (const entry of value.positions) {
		if (
			!isRecord(entry) ||
			!isFloatingWindowId(entry.id) ||
			positions.has(entry.id) ||
			typeof entry.x !== "number" ||
			!Number.isFinite(entry.x) ||
			typeof entry.y !== "number" ||
			!Number.isFinite(entry.y)
		) {
			throw new Error(INVALID_STORED_POSITION_MESSAGE);
		}
		positions.set(entry.id, { x: entry.x, y: entry.y });
	}
	return positions;
}

/**
 * Сохраняет координаты последних записей Map без контента и DOM-размеров.
 * Ограничивает также длину JSON: экранированный ID может занимать существенно
 * больше исходных 256 символов, поэтому одного ограничения числа окон мало.
 */
export function serializeFloatingWindowsPositions(positions: ReadonlyMap<string, FloatingWindowPosition>): string {
	const entries = [...positions].slice(-POSITIONS_STORAGE_MAX_POSITIONS);
	const prefix = `{"version":${POSITIONS_STORAGE_VERSION},"positions":[`;
	const suffix = "]}";
	const serializedEntries: string[] = [];
	let textLength = prefix.length + suffix.length;

	for (let index = entries.length - 1; index >= 0; index -= 1) {
		const [id, position] = entries[index];
		if (!isFloatingWindowId(id) || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
			throw new Error(INVALID_STORED_POSITION_MESSAGE);
		}

		const entry = JSON.stringify({ id, x: position.x, y: position.y });
		const nextLength = textLength + entry.length + (serializedEntries.length === 0 ? 0 : 1);
		if (nextLength > POSITIONS_STORAGE_MAX_TEXT_LENGTH) break;

		serializedEntries.push(entry);
		textLength = nextLength;
	}

	return `${prefix}${serializedEntries.reverse().join(",")}${suffix}`;
}
