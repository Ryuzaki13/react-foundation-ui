import type { ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Scrollable } from "../misc";

export interface ListContentProps<T> {
	readonly items: readonly T[];
	readonly getKey: (item: T, index: number) => string;
	readonly render: (item: T) => ReactNode;
	readonly separated?: boolean;
	readonly className?: string;
}

/** Невиртуальный вариант сохраняет прежний API для небольших наборов. */
export function ListContent<T>({ items, getKey, render, separated, className }: ListContentProps<T>) {
	return (
		<Scrollable className={className}>
			<ul>
				{items.map((item, index) => (
					<li key={getKey(item, index)} className={cn(separated && "borderBottom")}>
						{render(item)}
					</li>
				))}
			</ul>
		</Scrollable>
	);
}
