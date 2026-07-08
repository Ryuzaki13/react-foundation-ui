import React, { Children, PropsWithChildren, useMemo, useRef } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { useFetchNextPageEffect } from "@ryuzaki13/react-foundation-lib/virtualizer";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Grid } from "../grid";
import { LoadingMessage, Scrollable } from "../misc";

interface ListToolbarProps {
	children: React.ReactNode;
	className?: string;
}

const ListToolbar: React.FC<ListToolbarProps> = ({ children, className }) => {
	if (Children.count(children) === 0) {
		// Пустой блок для корректной работы родительского шаблона auto 1fr auto
		return <div></div>;
	}

	return (
		<Grid.Container gap="sm" className={cn("paddingSm borderBottom", className)}>
			{children}
		</Grid.Container>
	);
};

interface ListFooterProps {
	children: React.ReactNode;
	className?: string;
}

const ListFooter: React.FC<ListFooterProps> = ({ children, className }) => {
	if (Children.count(children) === 0) {
		// Пустой блок для корректной работы родительского шаблона auto 1fr auto
		return <div></div>;
	}

	return (
		<Grid.Container gap="sm" className={cn("paddingSm borderTop", className)}>
			{children}
		</Grid.Container>
	);
};

interface ListItemProps<T> {
	item: T;
	render: (item: T) => React.ReactNode;
	separated?: boolean;
}

function ListItem<T>({ item, render, separated }: ListItemProps<T>) {
	return (
		<React.Fragment>
			<li className={cn(separated && "borderBottom")}>{render(item)}</li>
			{/* {separated && <Separator as="li" />} */}
		</React.Fragment>
	);
}

interface ListContentProps<T> {
	items: T[];
	getKey: (item: T, index: number) => string;
	render: (item: T) => React.ReactNode;
	separated?: boolean;
	className?: string;
}

function ListContent<T>({ items, getKey, render, separated, className }: ListContentProps<T>) {
	return (
		<Scrollable className={className}>
			<ul className="">
				{items.map((item, index) => (
					<ListItem<T> key={getKey(item, index)} item={item} render={render} separated={separated} />
				))}
			</ul>
		</Scrollable>
	);
}

interface ListVirtualizedContentProps<T> {
	items: T[];
	getKey: (item: T, index: number) => string;
	render: (item: T) => React.ReactNode;
	isLoading?: boolean;
	separated?: boolean;
	className?: string;
	/** Параметры для бесконечной подгрузки */
	hasNextPage: boolean;
	fetchNextPage: () => Promise<unknown>;
}

function ListVirtualizedContent<T>({
	items,
	getKey,
	render,
	separated,
	className,
	isLoading,
	hasNextPage,
	fetchNextPage
}: ListVirtualizedContentProps<T>) {
	const parentRef = useRef<HTMLDivElement | null>(null);

	const useVirtualizerConfig = (itemsCount: number, hasNextPage: boolean | undefined, parentRef: React.RefObject<HTMLElement | null>) => {
		return useMemo(
			() => ({
				count: hasNextPage ? itemsCount + 1 : itemsCount,
				getScrollElement: () => parentRef.current,
				measureElement: (el: Element) => Math.ceil(el.getBoundingClientRect().height),
				estimateSize: () => 120,
				overscan: 5
			}),
			[itemsCount, hasNextPage, parentRef]
		);
	};

	const config = useVirtualizerConfig(items.length, hasNextPage, parentRef);
	const rowVirtualizer = useVirtualizer(config);

	const virtualItems = rowVirtualizer.getVirtualItems();

	useFetchNextPageEffect({ virtualItems, currentItemsCount: items.length, hasNextPage, fetchNextPage });

	return (
		<Scrollable ref={parentRef} className={className}>
			{isLoading ? (
				<LoadingMessage />
			) : (
				<ul style={{ height: rowVirtualizer.getTotalSize() }} className="relative w100">
					{virtualItems.map((virtualRow) => {
						const isLoaderRow = virtualRow.index > items.length - 1;
						const item = items[virtualRow.index];

						return (
							<React.Fragment key={isLoaderRow ? "loader" : getKey(item, virtualRow.index)}>
								<li
									ref={rowVirtualizer.measureElement}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${Math.round(virtualRow.start)}px)`
									}}
									data-index={virtualRow.index}
									className={cn(separated && "borderBottom")}>
									{isLoaderRow ? <LoadingMessage /> : render(item)}
								</li>
							</React.Fragment>
						);
					})}
				</ul>
			)}
		</Scrollable>
	);
}

interface ListComposition {
	Toolbar: typeof ListToolbar;
	Content: typeof ListContent;
	Footer: typeof ListFooter;
	VirtualizedContent: typeof ListVirtualizedContent;
}

interface ListProps extends PropsWithChildren {
	className?: string;
}

export const List: React.FC<ListProps> & ListComposition = ({ className, children }) => {
	return (
		<Grid.Container templateRows="auto 1fr auto" className={cn("h100", className)}>
			{children}
		</Grid.Container>
	);
};

// Компоновка
List.Toolbar = ListToolbar;
List.Content = ListContent;
List.Footer = ListFooter;
List.VirtualizedContent = ListVirtualizedContent;
