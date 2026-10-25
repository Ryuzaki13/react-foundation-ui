import { type ReactNode } from "react";

import { GridList, type GridListContentProps, type GridListGrouping } from "../src/grid-list";

type Item = { readonly id: string; readonly label: string; readonly detail: number };
type ContentProps = GridListContentProps<Item>;
type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const items: readonly Item[] = [{ id: "one", label: "Запись", detail: 1 }];
const fullProps = {
	items,
	getKey: (item) => item.id,
	render: (item) => item.detail,
	minItemWidth: "16rem",
	maxColumns: 4,
	gap: "md",
	estimateSize: 160,
	overscan: 3,
	resetKey: "query",
	preserveScrollAnchor: true,
	"aria-label": "Записи"
} satisfies ContentProps;

const inferred = <GridList.Content {...fullProps} />;
const explicit = <GridList.Content<Item> {...fullProps} />;
const complete = <GridList.Content {...fullProps} hasNextPage={false} />;
const pagination = <GridList.Content {...fullProps} hasNextPage={Boolean(items.length)} fetchNextPage={async () => undefined} />;
const grouping = {
	getKey: (item, index) => `${item.detail}:${index % 2}`,
	render: (key, grouped) => `${key}: ${grouped[0]?.label ?? ""}`
} satisfies GridListGrouping<Item>;
const grouped = <GridList.Content {...fullProps} grouping={grouping} />;
const inferredGrouping = (
	<GridList.Content
		items={items}
		getKey={(item, index) => `${item.id}:${index}`}
		render={(item) => item.detail}
		minItemWidth="16rem"
		grouping={{ getKey: (item) => String(item.detail), render: (key, grouped) => `${key}: ${grouped[0]?.label}` }}
	/>
);
const composition = (
	<GridList>
		<GridList.Toolbar />
		{inferred}
		<GridList.Footer />
	</GridList>
);

void inferred;
void explicit;
void complete;
void pagination;
void grouped;
void inferredGrouping;
void composition;

export type GridListReadonlySourceContract = Expect<Equal<ContentProps["items"], readonly Item[]>>;
export type GridListKeyItemContract = Expect<Equal<Parameters<ContentProps["getKey"]>[0], Item>>;
export type GridListKeySourceIndexContract = Expect<Equal<Parameters<ContentProps["getKey"]>[1], number>>;
export type GridListRenderItemContract = Expect<Equal<Parameters<ContentProps["render"]>[0], Item>>;
export type GridListGroupingReadonlySourceContract = Expect<Equal<Parameters<GridListGrouping<Item>["render"]>[1], readonly Item[]>>;
export type GridListGroupingRenderResultContract = Expect<Equal<ReturnType<GridListGrouping<Item>["render"]>, ReactNode>>;
export type GridListVisibleSourceKeysContract = Expect<
	Equal<Parameters<NonNullable<ContentProps["onVisibleKeysChange"]>>[0], readonly string[]>
>;
export type GridListRequiresWidthContract = Expect<
	Equal<Omit<typeof fullProps, "minItemWidth"> extends ContentProps ? true : false, false>
>;
export type GridListTrueRequiresFetchContract = Expect<
	Equal<typeof fullProps & { hasNextPage: true } extends ContentProps ? true : false, false>
>;
