import type { TabsDescriptor, TabsMountStrategy } from "../model/types";

/**
 * Возвращает идентификатор первой доступной вкладки.
 */
export function getFirstEnabledTabId(items: TabsDescriptor[]) {
	return items.find((item) => !item.disabled)?.id ?? null;
}

/**
 * Возвращает безопасный идентификатор вкладки.
 * Если переданный `candidate` недоступен, выбирается первая доступная вкладка.
 */
export function getSafeTabId(items: TabsDescriptor[], candidate: string | undefined | null) {
	if (!candidate) {
		return getFirstEnabledTabId(items);
	}

	const matchedItem = items.find((item) => item.id === candidate && !item.disabled);
	return matchedItem?.id ?? getFirstEnabledTabId(items);
}

/**
 * Возвращает только доступные вкладки для roving focus и клавиатурной навигации.
 */
export function getEnabledTabs(items: TabsDescriptor[]) {
	return items.filter((item) => !item.disabled);
}

interface ShouldMountTabPanelOptions {
	mountStrategy: TabsMountStrategy;
	isSelected: boolean;
	isVisited: boolean;
}

/**
 * Определяет, должна ли панель оставаться смонтированной с учётом стратегии монтирования.
 */
export function shouldMountTabPanel({ mountStrategy, isSelected, isVisited }: ShouldMountTabPanelOptions) {
	return mountStrategy === "keep-mounted" || isSelected || (mountStrategy === "lazy" && isVisited);
}
