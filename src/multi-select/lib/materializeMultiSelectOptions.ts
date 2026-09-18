/**
 * Создаёт mutable-снимок readonly options. Сохранение ссылки включается только
 * legacy-адаптером, чей опубликованный callback-контракт исторически mutable.
 */
export function materializeMultiSelectOptions<TOption>(options: readonly TOption[], preserveArrayReference = false): TOption[] {
	if (preserveArrayReference && Array.isArray(options)) {
		return options;
	}

	return [...options];
}
