import { useMemo } from "react";

import {
	buildAnalyticalTableModel,
	projectAnalyticalTableExpansion,
	type AnalyticalModelRow
} from "@ryuzaki13/react-foundation-lib/analytical-table";
import { compileFormattersPipelineRuntime, type FormattersPipelineRuntimeField } from "@ryuzaki13/react-foundation-lib/formatters";
import { normalizeTableColumnWidth } from "@ryuzaki13/react-foundation-lib/table";

import { indexAnalyticalHeaderGroups } from "../lib/analyticalHeaderGroups";
import { type AnalyticalTableProps, type AnalyticalTableRuntime } from "../types/analyticalTable";

import { useAnalyticalTableState } from "./useAnalyticalTableState";

/** Snapshot остаётся единственным входом данных; все команды меняют только представление. */
export function useAnalyticalTableModel<T>(props: AnalyticalTableProps<T>): AnalyticalTableRuntime<T> {
	const { state, patchState } = useAnalyticalTableState(props);
	const { grouping, sorting, filters, expandedRowIds } = state;
	const rows = props.snapshot.rows;
	const { aggregate, isAggregateRow, grandTotalsScope } = props.aggregation ?? {};
	const baseModel = useMemo(
		() =>
			buildAnalyticalTableModel({
				snapshot: { rows },
				columns: props.columns,
				state: { grouping, sorting, filters },
				aggregate,
				isAggregateRow,
				grandTotalsScope,
				grandTotals: props.showGrandTotals ?? true
			}),
		[rows, props.columns, aggregate, isAggregateRow, grandTotalsScope, props.showGrandTotals, grouping, sorting, filters]
	);
	const maxRowLevel = useMemo(() => baseModel.flatRows.reduce((max, row) => Math.max(max, row.level), 0), [baseModel.flatRows]);
	const model = useMemo(() => projectAnalyticalTableExpansion(baseModel, expandedRowIds ?? []), [baseModel, expandedRowIds]);
	const columns = props.columns;
	const formattingFields = useMemo(
		() =>
			Object.fromEntries(
				columns.map((column) => [
					column.id,
					compileFormattersPipelineRuntime<FormattersPipelineRuntimeField>({
						id: column.id,
						role: column.kind ?? "dimension",
						type:
							column.valueType === "number"
								? "decimal"
								: column.valueType === "date"
									? "datetime"
									: (column.valueType ?? "string"),
						formattersPipeline: column.formatting
					})
				])
			),
		[columns]
	);
	const visibleColumns = useMemo(() => {
		const hidden = new Set(state.hiddenColumnIds);
		const shownGroupingIds: string[] = [];
		for (const group of grouping ?? []) {
			const ids = [...group.keyColumnIds, ...(group.displayColumnIds ?? [])];
			if (group.showAsColumn) {
				const displayIds = group.displayColumnIds ?? group.keyColumnIds;
				shownGroupingIds.push(...displayIds);
				displayIds.forEach((id) => hidden.delete(id));
			} else ids.forEach((id) => hidden.add(id));
		}
		const groupIndex = indexAnalyticalHeaderGroups(props.columnGroups);
		for (const [groupId, ids] of groupIndex.descendants) {
			if (!state.collapsedColumnGroupIds?.includes(groupId)) continue;
			const group = groupIndex.paths.get(ids[0])?.find((group) => group.id === groupId);
			const retained = ids.includes(group?.collapsedColumnId ?? "")
				? group!.collapsedColumnId!
				: ids.find((id) => columns.some((column) => column.id === id));
			for (const id of ids) if (id !== retained) hidden.add(id);
			// Summary должен оставаться видимым, иначе из шапки исчезнет команда раскрытия.
			if (retained) hidden.delete(retained);
		}
		const order = [
			...new Set([
				...(state.pinnedColumnIds ?? []),
				...shownGroupingIds,
				...(state.columnOrder ?? []),
				...columns.map((column) => column.id)
			])
		];
		const byId = new Map(columns.map((column) => [column.id, column]));
		return order.flatMap((id) => {
			const column = byId.get(id);
			return column && !hidden.has(id) ? [column] : [];
		});
	}, [
		columns,
		props.columnGroups,
		state.collapsedColumnGroupIds,
		state.hiddenColumnIds,
		state.columnOrder,
		state.pinnedColumnIds,
		grouping
	]);
	const expandedIds = () =>
		state.expandedRowIds === "all"
			? model.flatRows.filter((row) => row.isExpandable).map((row) => row.id)
			: [...(state.expandedRowIds ?? [])];
	const toggleRow = (id: string) => {
		if (!model.rowById.get(id)?.isExpandable) return;
		const expanded = expandedIds();
		patchState({ expandedRowIds: expanded.includes(id) ? expanded.filter((value) => value !== id) : [...expanded, id] });
	};
	const collapseBranch = (id: string) => {
		const removed = new Set<string>();
		const visit = (row: AnalyticalModelRow<T>) => {
			removed.add(row.id);
			row.children.forEach(visit);
		};
		const row = model.rowById.get(id);
		if (row) visit(row);
		patchState({ expandedRowIds: expandedIds().filter((value) => !removed.has(value)) });
	};
	const sortColumn: AnalyticalTableRuntime<T>["sortColumn"] = (id, direction, multi = false) => {
		if (!columns.some((column) => column.id === id && column.sortable !== false)) return;
		const sorting = state.sorting ?? [];
		const current = sorting.find((item) => item.id === id);
		const nextDirection = direction ?? (!current ? "asc" : !current.desc ? "desc" : "clear");
		const rest = multi || direction === "clear" ? sorting.filter((item) => item.id !== id) : [];
		patchState({ sorting: nextDirection === "clear" ? rest : [...rest, { id, desc: nextDirection === "desc" }] });
	};
	const groupColumn = (id: string) => {
		const column = columns.find((item) => item.id === id);
		if (!column || props.enableGrouping === false || column.groupable === false || column.kind === "measure") return;
		const group = column?.grouping ?? { id, keyColumnIds: [id], displayColumnIds: [id], label: column?.label };
		if (state.grouping?.some((item) => item.id === group.id)) return;
		patchState({ grouping: [...(state.grouping ?? []), group] });
	};
	return {
		model,
		maxRowLevel,
		formattingFields,
		state,
		columns,
		visibleColumns,
		patchState,
		toggleRow,
		collapseBranch,
		sortColumn,
		groupColumn,
		collapseAll: () => patchState({ expandedRowIds: [] }),
		ungroupColumn: (id) => {
			if (props.enableGrouping !== false) patchState({ grouping: state.grouping?.filter((group) => group.id !== id) ?? [] });
		},
		moveGrouping: (id, offset) => {
			if (props.enableGrouping === false) return;
			const groups = [...(state.grouping ?? [])];
			const index = groups.findIndex((group) => group.id === id);
			const destination = index + offset;
			if (index < 0 || destination < 0 || destination >= groups.length) return;
			const [group] = groups.splice(index, 1);
			groups.splice(destination, 0, group);
			patchState({ grouping: groups });
		},
		filterColumn: (id, value) => {
			if (columns.some((column) => column.id === id && column.filterable !== false))
				patchState({ filters: [...(state.filters ?? []).filter((filter) => filter.id !== id), { id, operator: "equals", value }] });
		},
		clearFilter: (id) => patchState({ filters: state.filters?.filter((filter) => filter.id !== id) ?? [] }),
		pinColumn: (id) => {
			if (columns.some((column) => column.id === id))
				patchState({
					pinnedColumnIds: state.pinnedColumnIds?.includes(id)
						? state.pinnedColumnIds.filter((value) => value !== id)
						: [...(state.pinnedColumnIds ?? []), id]
				});
		},
		hideColumn: (id) => {
			if (visibleColumns.length > 1 && columns.some((column) => column.id === id && column.hideable !== false))
				patchState({ hiddenColumnIds: [...new Set([...(state.hiddenColumnIds ?? []), id])] });
		},
		resizeColumn: (id, width) => {
			const column = columns.find((column) => column.id === id);
			if (column && props.enableColumnResizing !== false)
				patchState({ columnWidths: { ...state.columnWidths, [id]: normalizeTableColumnWidth(width, column.minWidth ?? 60) } });
		}
	};
}
