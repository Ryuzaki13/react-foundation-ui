import { type ReactNode } from "react";

import { List, type ListColumns, type ListContentProps, type ListGrouping, type ListVirtualizedContentProps } from "../src/list";

type Item = Readonly<{ id: string; label: string; detail: number }>;
type VirtualizedProps = ListVirtualizedContentProps<Item>;
type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const items: readonly Item[] = [{ id: "one", label: "Первая строка", detail: 1 }];
const fullProps = {
	items,
	getKey: (item) => item.id,
	render: (item) => item.detail,
	estimateSize: 80,
	overscan: 3,
	preserveScrollAnchor: true,
	resetKey: "query",
	emptyContent: "Пусто",
	"aria-label": "Типизированный список"
} satisfies VirtualizedProps;
const inferred = <List.VirtualizedContent {...fullProps} />;
const explicit = <List.VirtualizedContent<Item> {...fullProps} />;
const nonVirtualized = <List.Content items={items} getKey={(item) => item.id} render={(item) => item.detail} />;
const complete = <List.VirtualizedContent {...fullProps} hasNextPage={false} />;

// Обе части принимают исходные записи; группировка не заставляет consumer собирать собственный union строк и заголовков.
const columns = { count: 3, minItemWidth: "16rem" } satisfies ListColumns;
const grouping = {
	getKey: (item, sourceIndex) => `${item.detail}:${sourceIndex % 2}`,
	render: (groupKey, groupItems) => `${groupKey}: ${groupItems[0]?.label ?? "Пусто"}`
} satisfies ListGrouping<Item>;
const columnContentProps = {
	items,
	getKey: (item, sourceIndex) => `${item.id}:${sourceIndex}`,
	render: (item) => item.detail,
	columns
} satisfies ListContentProps<Item>;
const columnsWithoutGroups = <List.Content {...columnContentProps} />;
const groupsWithoutColumns = <List.Content items={items} getKey={(item) => item.id} render={(item) => item.label} grouping={grouping} />;
const groupedColumnContent = <List.Content {...columnContentProps} grouping={grouping} />;
const virtualColumnsWithoutGroups = <List.VirtualizedContent {...fullProps} columns={columns} />;
const groupedVirtualColumns = <List.VirtualizedContent {...fullProps} columns={columns} grouping={grouping} />;
const inferredGrouping = (
	<List.VirtualizedContent
		items={items}
		getKey={(item) => item.id}
		render={(item) => item.detail}
		columns={{ count: 2 }}
		grouping={{
			getKey: (item, sourceIndex) => `${item.detail}:${sourceIndex}`,
			render: (groupKey, groupItems) => `${groupKey}: ${groupItems[0]?.label}`
		}}
	/>
);

// Этот shape сохраняет прежний consumer contract, где boolean приходит из Query.
const legacyProps = {
	...fullProps,
	hasNextPage: Boolean(items.length),
	fetchNextPage: async (): Promise<unknown> => undefined
} satisfies VirtualizedProps;
const legacy = <List.VirtualizedContent {...legacyProps} />;

void inferred;
void explicit;
void complete;
void nonVirtualized;
void legacy;
void columnsWithoutGroups;
void groupsWithoutColumns;
void groupedColumnContent;
void virtualColumnsWithoutGroups;
void groupedVirtualColumns;
void inferredGrouping;

export type ListReadonlySourceContract = Expect<Equal<VirtualizedProps["items"], readonly Item[]>>;
export type ListKeyItemContract = Expect<Equal<Parameters<VirtualizedProps["getKey"]>[0], Item>>;
export type ListRenderItemContract = Expect<Equal<Parameters<VirtualizedProps["render"]>[0], Item>>;
export type ListColumnsContract = Expect<Equal<VirtualizedProps["columns"], ListColumns | undefined>>;
export type ListGroupingContract = Expect<Equal<VirtualizedProps["grouping"], ListGrouping<Item> | undefined>>;
export type ListGroupingKeyItemContract = Expect<Equal<Parameters<ListGrouping<Item>["getKey"]>[0], Item>>;
export type ListGroupingSourceIndexContract = Expect<Equal<Parameters<ListGrouping<Item>["getKey"]>[1], number>>;
export type ListGroupingKeyContract = Expect<Equal<ReturnType<ListGrouping<Item>["getKey"]>, string>>;
export type ListGroupingRenderKeyContract = Expect<Equal<Parameters<ListGrouping<Item>["render"]>[0], string>>;
export type ListGroupingReadonlyItemsContract = Expect<Equal<Parameters<ListGrouping<Item>["render"]>[1], readonly Item[]>>;
export type ListGroupingRenderResultContract = Expect<Equal<ReturnType<ListGrouping<Item>["render"]>, ReactNode>>;
export type ListVisibleSourceKeysContract = Expect<
	Equal<Parameters<NonNullable<VirtualizedProps["onVisibleKeysChange"]>>[0], readonly string[]>
>;
export type ListFullModeContract = Expect<Equal<typeof fullProps extends VirtualizedProps ? true : false, true>>;
export type ListTrueRequiresFetchContract = Expect<
	Equal<Omit<typeof fullProps, "resetKey"> & { hasNextPage: true } extends VirtualizedProps ? true : false, false>
>;
