import { type PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexContainer } from "../flex";

import styles from "./GridList.module.scss";
import { GridListContent } from "./GridListContent";
import { GridListFooter } from "./GridListFooter";
import { GridListToolbar } from "./GridListToolbar";

export type GridListProps = PropsWithChildren & { readonly className?: string };

/** Компоновка виртуальной сетки с необязательными неподвижными панелями и ограниченной внешней высотой. */
export function GridList({ className, children }: GridListProps) {
	return (
		<FlexContainer column className={cn("h100", styles.layout, className)}>
			{children}
		</FlexContainer>
	);
}

GridList.Toolbar = GridListToolbar;
GridList.Content = GridListContent;
GridList.Footer = GridListFooter;
