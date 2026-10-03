import type { PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Grid } from "../grid";

import { ListContent } from "./ListContent";
import { ListFooter } from "./ListFooter";
import { ListToolbar } from "./ListToolbar";
import { ListVirtualizedContent } from "./ListVirtualizedContent";

export interface ListProps extends PropsWithChildren {
	readonly className?: string;
}

/** Компоновка списка: неподвижные toolbar/footer и единственная прокручиваемая область. */
export function List({ className, children }: ListProps) {
	return (
		<Grid.Container templateRows="auto minmax(0, 1fr) auto" className={cn("h100", className)}>
			{children}
		</Grid.Container>
	);
}

// Опубликованный compound API сохраняется; поведение частей принадлежит отдельным компонентам.
List.Toolbar = ListToolbar;
List.Content = ListContent;
List.Footer = ListFooter;
List.VirtualizedContent = ListVirtualizedContent;
