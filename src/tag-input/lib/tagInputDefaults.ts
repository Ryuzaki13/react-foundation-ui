/** Удаляет внешние пробелы перед сохранением созданного тега. */
export function defaultNormalizeTag(value: string) {
	return value.trim();
}

/** Сохраняет регистр и использует точное значение как ключ сравнения по умолчанию. */
export function defaultGetTagKey(value: string) {
	return value;
}

/** Формирует доступное имя действия удаления с конкретным значением тега. */
export function defaultGetRemoveButtonAriaLabel(value: string) {
	return `Удалить тег «${value}»`;
}
