import { type ListColumns } from "../listLayoutTypes";

/** Только CSS меняет перенос: SSR и клиент собирают одинаковые строки из count элементов. */
export function resolveListColumnTemplate(columns: ListColumns): string {
	return columns.minItemWidth
		? `repeat(auto-fit, minmax(min(100%, ${columns.minItemWidth}), 1fr))`
		: `repeat(${columns.count}, minmax(0, 1fr))`;
}
