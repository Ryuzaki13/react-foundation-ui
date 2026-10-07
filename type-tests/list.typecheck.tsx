import { type ComponentProps, type PropsWithChildren } from "react";

import { List, type ListVirtualizedContentProps } from "../src/list";

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

export type ListReadonlySourceContract = Expect<Equal<VirtualizedProps["items"], readonly Item[]>>;
// Упрощение 3.24.0 согласовано явно: только children, без старого className API.
export type ListToolbarChildrenContract = Expect<Equal<ComponentProps<typeof List.Toolbar>, PropsWithChildren>>;
export type ListFooterChildrenContract = Expect<Equal<ComponentProps<typeof List.Footer>, PropsWithChildren>>;
export type ListToolbarClassNameRemovedContract = Expect<
	Equal<"className" extends keyof ComponentProps<typeof List.Toolbar> ? true : false, false>
>;
export type ListFooterClassNameRemovedContract = Expect<
	Equal<"className" extends keyof ComponentProps<typeof List.Footer> ? true : false, false>
>;
export type ListKeyItemContract = Expect<Equal<Parameters<VirtualizedProps["getKey"]>[0], Item>>;
export type ListRenderItemContract = Expect<Equal<Parameters<VirtualizedProps["render"]>[0], Item>>;
export type ListFullModeContract = Expect<Equal<typeof fullProps extends VirtualizedProps ? true : false, true>>;
export type ListTrueRequiresFetchContract = Expect<
	Equal<Omit<typeof fullProps, "resetKey"> & { hasNextPage: true } extends VirtualizedProps ? true : false, false>
>;
