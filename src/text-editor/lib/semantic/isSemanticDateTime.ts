import { parseDate } from "@ryuzaki13/react-foundation-lib/formatters";

/** Проверка календарных значений диалогов поверх строгого foundation parser. */
export function isSemanticDateTime(value: string): boolean {
	const parts = value.split("/");
	return (
		parts.length <= 2 &&
		parts.every((part) => {
			if (/^\d{2}:\d{2}(?::\d{2})?$/.test(part)) return parseDate(`2000-01-01T${part}`) !== null;
			return (
				/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/.test(part) &&
				parseDate(part) !== null
			);
		})
	);
}
