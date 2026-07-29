/**
 * Строковые значения по умолчанию позволяют использовать StringToggle
 * как строковое представление обычного boolean-переключателя.
 */
export const DEFAULT_STRING_TOGGLE_CHECKED_VALUE = "true";
export const DEFAULT_STRING_TOGGLE_UNCHECKED_VALUE = "false";

/**
 * Возвращает переданную строку буквально, включая пустую строку и пробелы.
 * Fallback применяется только когда строковое значение отсутствует.
 */
export function resolveStringToggleStateValue(value: unknown, fallback: string): string {
	return typeof value === "string" ? value : fallback;
}
