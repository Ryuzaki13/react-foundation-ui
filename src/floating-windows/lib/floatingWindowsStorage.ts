import { isRecord } from "@ryuzaki13/react-foundation-lib/validators";

import { type FloatingWindowPosition } from "../model/floatingWindowsTypes";

import { isFloatingWindowId } from "./isFloatingWindowId";

const maximumPositions = 200;
const maximumTextLength = 64 * 1024;

/** Неавторитетный cache не мигрируется: неизвестная версия/форма отклоняется целиком и не попадает в геометрию. */
export function readFloatingWindowsPositions(text: string): ReadonlyMap<string, FloatingWindowPosition> {
	if (text.length > maximumTextLength) throw new Error("Сохранённые позиции окон превышают допустимый размер.");
	const value: unknown = JSON.parse(text);
	if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.positions) || value.positions.length > maximumPositions) {
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
			throw new Error("Сохранённая позиция окна не прошла проверку.");
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
	const entries = [...positions].slice(-maximumPositions);
	const prefix = '{"version":1,"positions":[';
	const suffix = "]}";
	const serializedEntries: string[] = [];
	let textLength = prefix.length + suffix.length;

	for (let index = entries.length - 1; index >= 0; index -= 1) {
		const [id, position] = entries[index];
		if (!isFloatingWindowId(id) || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
			throw new Error("Сохранённая позиция окна не прошла проверку.");
		}

		const entry = JSON.stringify({ id, x: position.x, y: position.y });
		const nextLength = textLength + entry.length + (serializedEntries.length === 0 ? 0 : 1);
		if (nextLength > maximumTextLength) break;

		serializedEntries.push(entry);
		textLength = nextLength;
	}

	return `${prefix}${serializedEntries.reverse().join(",")}${suffix}`;
}
