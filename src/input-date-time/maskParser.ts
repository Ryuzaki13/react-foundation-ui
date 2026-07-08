import {
	type DateMaskSegment,
	type DateSegmentId,
	dateToIndexedSegmentValues,
	type EditableDateSegment,
	indexedSegmentsToDate,
	type LiteralDateSegment,
	parseDateSegmentMask
} from "@ryuzaki13/react-foundation-lib/date-segments";

/**
 * Совместимый тип сегмента для существующего `InputDateTime`.
 */
export type SegmentType = DateSegmentId;

/**
 * Совместимый редактируемый сегмент для существующего `InputDateTime`.
 */
export interface EditableSegment extends Omit<EditableDateSegment, "id"> {
	type: SegmentType;
}

/**
 * Совместимый литеральный сегмент для существующего `InputDateTime`.
 */
export type LiteralSegment = LiteralDateSegment;

/**
 * Совместимый тип сегмента маски для существующего `InputDateTime`.
 */
export type Segment = EditableSegment | LiteralSegment;

/**
 * Разбирает строковую маску, сохраняя прежний контракт `InputDateTime`.
 */
export function parseMask(mask: string): Segment[] {
	return parseDateSegmentMask(mask).map((segment) => (segment.kind === "editable" ? { ...segment, type: segment.id } : segment));
}

/**
 * Преобразует Date в карту значений сегментов по их совместимым типам.
 */
export function dateToSegmentValues(date: Date | undefined, segments: Segment[]): Map<SegmentType, string> {
	const indexedValues = dateToIndexedSegmentValues(date, segments as DateMaskSegment[]);
	const values = new Map<SegmentType, string>();

	segments.forEach((segment, index) => {
		if (segment.kind !== "editable") return;
		values.set(segment.type, indexedValues.get(index) ?? "");
	});

	return values;
}

/**
 * Собирает строгий Date из карты сегментов старого формата.
 */
export function segmentsToDate(segments: Segment[], values: Map<SegmentType, string>): Date | null {
	const indexedValues = new Map<number, string>();

	segments.forEach((segment, index) => {
		if (segment.kind !== "editable") return;
		indexedValues.set(index, values.get(segment.type) ?? "");
	});

	return indexedSegmentsToDate(segments as DateMaskSegment[], indexedValues);
}
