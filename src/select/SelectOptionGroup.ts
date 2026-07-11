import { ReactNode } from "react";

export type SelectOptionKey = string | number;

/**
 * Описывает визуальную группу опций Select.
 * Одинаковый ключ объединяет соседние опции под одним доступным заголовком, а undefined оставляет опцию без группы.
 */
export type SelectOptionGroup = {
	readonly key: SelectOptionKey;
	readonly label: ReactNode;
};
