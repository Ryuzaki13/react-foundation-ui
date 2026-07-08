import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { horizontalListSortingStrategy, rectSortingStrategy, verticalListSortingStrategy, type SortingStrategy } from "@dnd-kit/sortable";

export type SortableLayout = "vertical" | "horizontal" | "grid";

export interface SortableReorderResult {
	containerId: UniqueIdentifier;
	activeId: UniqueIdentifier;
	overId: UniqueIdentifier;
	fromIndex: number;
	toIndex: number;
}

type SortableItemsByContainer = Record<string, readonly UniqueIdentifier[]>;

function resolveContainerId(eventPart: DragEndEvent["active"] | DragEndEvent["over"] | null | undefined): UniqueIdentifier | null {
	return eventPart?.data.current?.sortable.containerId ?? null;
}

function resolveContainerItems(
	containerId: UniqueIdentifier,
	items: readonly UniqueIdentifier[] | SortableItemsByContainer
): readonly UniqueIdentifier[] | null {
	if (Array.isArray(items)) {
		return items;
	}

	return (items as SortableItemsByContainer)[String(containerId)] ?? null;
}

export function resolveSortableStrategy(layout: SortableLayout, strategy?: SortingStrategy): SortingStrategy {
	if (strategy) {
		return strategy;
	}

	switch (layout) {
		case "horizontal":
			return horizontalListSortingStrategy;
		case "grid":
			return rectSortingStrategy;
		case "vertical":
		default:
			return verticalListSortingStrategy;
	}
}

export function getSortableReorderResult(params: {
	event: DragEndEvent;
	items: readonly UniqueIdentifier[] | SortableItemsByContainer;
}): SortableReorderResult | null {
	const { event, items } = params;
	const { active, over } = event;

	if (!over || active.id === over.id) {
		return null;
	}

	const activeContainerId = resolveContainerId(active);
	const overContainerId = resolveContainerId(over);
	if (activeContainerId == null || overContainerId == null || activeContainerId !== overContainerId) {
		return null;
	}

	const containerItems = resolveContainerItems(activeContainerId, items);
	if (!containerItems) {
		return null;
	}

	const fromIndex = containerItems.indexOf(active.id);
	const toIndex = containerItems.indexOf(over.id);
	if (fromIndex < 0 || toIndex < 0) {
		return null;
	}

	return {
		containerId: activeContainerId,
		activeId: active.id,
		overId: over.id,
		fromIndex,
		toIndex
	};
}
