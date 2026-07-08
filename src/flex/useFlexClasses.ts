import { useMemo } from "react";

import { ResolvedProps } from "@ryuzaki13/react-foundation-lib/media";

import styles from "./Flex.module.scss";

import type { FlexContainerProps, FlexItemProps } from "./types";

type ClassName = string | undefined | null | false;

export type ResolvedFlexContainerProps = ResolvedProps<Omit<FlexContainerProps, "children" | "className" | "as" | "style">>;
export type ResolvedFlexItemProps = ResolvedProps<Omit<FlexItemProps, "children" | "className" | "as" | "style">>;

export const useFlexContainerClasses = (props: ResolvedFlexContainerProps) => {
	return useMemo(() => {
		const classes: ClassName[] = [styles.container];

		// Display
		if (props.inline) classes.push(styles.inline);

		// Direction (mutually exclusive)
		if (props.row) classes.push(styles.row);
		else if (props.column) classes.push(styles.column);
		else if (props.rowReverse) classes.push(styles.rowReverse);
		else if (props.columnReverse) classes.push(styles.columnReverse);

		// Wrap (mutually exclusive)
		if (props.wrap) classes.push(styles.wrap);
		else if (props.nowrap) classes.push(styles.nowrap);
		else if (props.wrapReverse) classes.push(styles.wrapReverse);

		// Alignment
		if (props.align) classes.push(styles[`align${props.align.charAt(0).toUpperCase() + props.align.slice(1)}` as keyof typeof styles]);

		// Justify
		if (props.justify)
			classes.push(styles[`justify${props.justify.charAt(0).toUpperCase() + props.justify.slice(1)}` as keyof typeof styles]);

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

		return classes.filter(Boolean).join(" ");
	}, [props]);
};

export const useFlexItemClasses = (props: ResolvedFlexItemProps) => {
	return useMemo(() => {
		const classes: ClassName[] = [styles.item];

		// Composite classes (highest priority)
		if (props.flex0) classes.push(styles.flex0);
		if (props.flex1) classes.push(styles.flex1);

		// Individual properties (only if composite not used)
		if (!props.flex0 && !props.flex1) {
			// Grow (default: false = 0)
			if (props.grow) classes.push(styles.grow);
			else classes.push(styles.grow0);

			// Shrink (default: true = 1)
			if (props.shrink === false) classes.push(styles.shrink0);
			else classes.push(styles.shrink);

			// Basis
			if (props.basis === "0") classes.push(styles.basis0);
			else if (props.basis === "auto") classes.push(styles.basisAuto);
		}

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

export const useFlexPredefinedClasses = (variant: string) => {
	return styles[variant as keyof typeof styles];
};
