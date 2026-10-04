import { type ListVirtualizerSnapshot } from "../model/listVirtualizerTypes";

/** Геометрия core уже измерена: наблюдение видимости не читает DOM каждой строки и не расширяется на overscan. */
export function selectListVisibleKeys(
	virtualItems: ListVirtualizerSnapshot["virtualItems"],
	offset: number,
	height: number
): readonly string[] {
	const end = offset + height;
	const keys: string[] = [];
	if (height > 0) {
		for (const row of virtualItems) {
			if (typeof row.key === "string" && row.end > row.start && row.end > offset && row.start < end) keys.push(row.key);
		}
	}
	return Object.freeze(keys);
}
