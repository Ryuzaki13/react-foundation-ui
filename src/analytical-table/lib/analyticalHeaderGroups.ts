import { type AnalyticalTableColumnGroup } from "../types/columns";

/** Индекс сохраняет вложенную геометрию шапки после visibility, collapse и pinning. */
export function indexAnalyticalHeaderGroups(groups: readonly AnalyticalTableColumnGroup[] = []) {
	const paths = new Map<string, readonly AnalyticalTableColumnGroup[]>();
	const descendants = new Map<string, readonly string[]>();
	let depth = 0;
	const visit = (group: AnalyticalTableColumnGroup, parents: readonly AnalyticalTableColumnGroup[]): string[] => {
		if (parents.some((parent) => parent.id === group.id)) return [];
		const path = [...parents, group];
		depth = Math.max(depth, path.length);
		for (const id of group.columnIds) paths.set(id, path);
		const ids = [...new Set([...group.columnIds, ...(group.children ?? []).flatMap((child) => visit(child, path))])];
		descendants.set(group.id, ids);
		return ids;
	};
	groups.forEach((group) => visit(group, []));
	return { paths, descendants, depth };
}

export type AnalyticalHeaderSegment = Readonly<{ id: string; group?: AnalyticalTableColumnGroup; count: number; offset?: number }>;

export function buildAnalyticalHeaderRows(
	ids: readonly string[],
	pinnedOffsets: ReadonlyMap<string, number>,
	groups: readonly AnalyticalTableColumnGroup[] = []
): readonly (readonly AnalyticalHeaderSegment[])[] {
	const index = indexAnalyticalHeaderGroups(groups);
	return Array.from({ length: index.depth }, (_, level) => {
		const row: { id: string; group?: AnalyticalTableColumnGroup; count: number; offset?: number }[] = [];
		for (const id of ids) {
			const group = index.paths.get(id)?.[level];
			const offset = pinnedOffsets.get(id);
			const previous = row.at(-1);
			if (previous && previous.group === group && (previous.offset !== undefined) === (offset !== undefined)) previous.count++;
			else row.push({ id, group, count: 1, offset });
		}
		return row;
	});
}
