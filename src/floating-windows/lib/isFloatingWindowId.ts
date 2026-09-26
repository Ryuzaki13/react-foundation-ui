/** Одинаковая граница identity для React-регистрации и недоверенного cache; ID не нормализуется неявно. */
export function isFloatingWindowId(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0 && value.length <= 256;
}
