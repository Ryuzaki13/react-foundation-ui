import { CSSProperties, useMemo } from "react";

import { ResolvedProps } from "@ryuzaki13/react-foundation-lib/media";

import styles from "./Grid.module.scss";

import type { GridContainerLayoutProps, GridItemLayoutProps } from "./types";

type ClassName = string | undefined | null | false;

export type ResolvedGridContainerProps = ResolvedProps<GridContainerLayoutProps>;
export type ResolvedGridItemProps = ResolvedProps<GridItemLayoutProps>;

export const useGridContainerClasses = (props: ResolvedGridContainerProps) => {
	return useMemo(() => {
		const classes: ClassName[] = [styles.grid];

		// Display
		if (props.inline) classes.push(styles.inline);

		// Auto flow
		if (props.column) classes.push(styles.column);
		else if (props.dense) classes.push(styles.dense);
		else if (props.row) classes.push(styles.row);

		// Alignment
		if (props.align) classes.push(styles[`align${props.align.charAt(0).toUpperCase() + props.align.slice(1)}` as keyof typeof styles]);

		// Justify items
		if (props.justify)
			classes.push(styles[`justify${props.justify.charAt(0).toUpperCase() + props.justify.slice(1)}` as keyof typeof styles]);

		// Justify content
		if (props.justifyContent)
			classes.push(
				styles[
					`justifyContent${props.justifyContent.charAt(0).toUpperCase() + props.justifyContent.slice(1)}` as keyof typeof styles
				]
			);

		// Align content
		if (props.alignContent)
			classes.push(
				styles[`alignContent${props.alignContent.charAt(0).toUpperCase() + props.alignContent.slice(1)}` as keyof typeof styles]
			);

		// Gap properties
		if (props.gap === "none") classes.push(styles.gapNone);
		else if (props.gap) classes.push(styles[`gap${props.gap.charAt(0).toUpperCase() + props.gap.slice(1)}` as keyof typeof styles]);

		if (props.gapRow)
			classes.push(styles[`gapRow${props.gapRow.charAt(0).toUpperCase() + props.gapRow.slice(1)}` as keyof typeof styles]);
		if (props.gapColumn)
			classes.push(styles[`gapColumn${props.gapColumn.charAt(0).toUpperCase() + props.gapColumn.slice(1)}` as keyof typeof styles]);

		// Предопределенные варианты
		if (props.variant === "single-column") classes.push(styles.singleColumn);
		else if (props.variant === "auto-1fr") classes.push(styles.autoRows1fr);
		else if (props.variant === "auto1fr-rows-auto") classes.push(styles.columnsAuto1fr);

		return classes.filter(Boolean).join(" ");
	}, [props]);
};

export const useGridContainerStyles = (
	props: Pick<ResolvedGridContainerProps, "templateColumns" | "templateRows" | "autoColumns" | "autoRows" | "areas">
) => {
	return useMemo(() => {
		const styles: CSSProperties = {};

		if (props.templateColumns) {
			// if (typeof props.templateColumns === "object") {
			//     styles.gridTemplateColumns = props.templateColumns;
			// } else {
			styles.gridTemplateColumns = props.templateColumns;
			// }
		}
		if (props.templateRows) {
			styles.gridTemplateRows = props.templateRows;
		}
		if (props.autoColumns) {
			styles.gridAutoColumns = props.autoColumns;
		}
		if (props.autoRows) {
			styles.gridAutoRows = props.autoRows;
		}
		if (props.areas) {
			styles.gridTemplateAreas = props.areas;
		}

		return styles;
	}, [props.templateColumns, props.templateRows, props.autoColumns, props.autoRows, props.areas]);
};

export const useGridItemClasses = (props: ResolvedGridItemProps) => {
	return useMemo(() => {
		const classes: ClassName[] = [styles.item];

		// Self alignment
		if (props.alignSelf)
			classes.push(styles[`alignSelf${props.alignSelf.charAt(0).toUpperCase() + props.alignSelf.slice(1)}` as keyof typeof styles]);

		// Justify self
		if (props.justifySelf)
			classes.push(
				styles[`justifySelf${props.justifySelf.charAt(0).toUpperCase() + props.justifySelf.slice(1)}` as keyof typeof styles]
			);

		return classes.filter(Boolean).join(" ");
	}, [props]);
};

export const useGridItemStyles = (props: Pick<ResolvedGridItemProps, "area" | "column" | "row">) => {
	return useMemo(() => {
		const styles: CSSProperties = {};

		if (props.area) {
			styles.gridArea = props.area;
		}
		if (props.column) {
			styles.gridColumn = props.column;
		}
		if (props.row) {
			styles.gridRow = props.row;
		}

		return styles;
	}, [props.area, props.column, props.row]);
};
