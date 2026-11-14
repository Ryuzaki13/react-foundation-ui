const FLOATING_WINDOW_ID_MAX_LENGTH = 256;

/** Ошибка регистрации и восстановления использует тот же предел, что и проверка ID. */
export const INVALID_FLOATING_WINDOW_ID_MESSAGE = `Идентификатор плавающего окна должен содержать от 1 до ${FLOATING_WINDOW_ID_MAX_LENGTH} символов и не состоять из пробелов.`;

/** Одинаковая граница identity для React-регистрации и недоверенного cache; ID не нормализуется неявно. */
export function isFloatingWindowId(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0 && value.length <= FLOATING_WINDOW_ID_MAX_LENGTH;
}
