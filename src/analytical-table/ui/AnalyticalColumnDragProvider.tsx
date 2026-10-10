import { useId, type ReactNode } from "react";

import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useDndSortableSensors } from "@ryuzaki13/react-foundation-lib/hooks";
import { resolveReorderedTableHeaderColumns } from "@ryuzaki13/react-foundation-lib/table";

import { Sortable } from "../../sortable";
import { type AnalyticalTableRuntime } from "../types/runtime";

type AnalyticalColumnDragProviderProps<T> = Readonly<{ runtime: AnalyticalTableRuntime<T>; enabled: boolean; children: ReactNode }>;

/** Live-region DnD находится вне table: браузер не перестраивает HTML при SSR hydration. */
export function AnalyticalColumnDragProvider<T>({ runtime, enabled, children }: AnalyticalColumnDragProviderProps<T>) {
	const id = useId();
	const sensors = useDndSortableSensors({
		activationDistance: 8,
		keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] }
	});
	const ids = runtime.visibleColumns.map((column) => column.id);
	return (
		<Sortable.Root
			id={id}
			sensors={sensors}
			modifiers={[restrictToHorizontalAxis]}
			onDragEnd={(event) => {
				if (!event.over || !enabled) return;
				const order = resolveReorderedTableHeaderColumns({
					order: runtime.state.columnOrder ?? runtime.columns.map((column) => column.id),
					headerIds: ids,
					pinnedIds: runtime.state.pinnedColumnIds,
					activeId: String(event.active.id),
					overId: String(event.over.id)
				});
				if (order) runtime.patchState({ columnOrder: order });
			}}>
			<Sortable.Container containerId={id} items={ids} layout="horizontal">
				{children}
			</Sortable.Container>
		</Sortable.Root>
	);
}
