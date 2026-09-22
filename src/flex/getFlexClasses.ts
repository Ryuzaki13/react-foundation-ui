import { type Breakpoint, resolveProps, type ResolvedProps } from "@ryuzaki13/react-foundation-lib/media";

import {
	hasResponsiveLayoutValue,
	RESPONSIVE_LAYOUT_BREAKPOINTS,
	resolveLayoutPropsForBreakpoints
} from "../responsive-layout/responsiveLayout";

import styles from "./Flex.module.scss";
import { type FlexContainerLayoutProps, type FlexItemLayoutProps } from "./types";

type ClassName = string | undefined | null | false;
type ResolvedFlexContainerProps = ResolvedProps<FlexContainerLayoutProps>;
type ResolvedFlexItemProps = ResolvedProps<FlexItemLayoutProps>;

const CONTAINER_RESPONSIVE_KEYS = [
	"inline",
	"row",
	"column",
	"rowReverse",
	"columnReverse",
	"wrap",
	"nowrap",
	"wrapReverse",
	"align",
	"justify",
	"alignContent",
	"gap",
	"gapRow",
	"gapColumn"
] as const satisfies readonly (keyof FlexContainerLayoutProps)[];

const ITEM_RESPONSIVE_KEYS = [
	"flex0",
	"flex1",
	"grow",
	"shrink",
	"basis",
	"alignSelf",
	"justifySelf"
] as const satisfies readonly (keyof FlexItemLayoutProps)[];

const breakpointSuffixes = {
	mobile: "Mobile",
	tablet: "Tablet",
	laptop: "Laptop"
} as const satisfies Record<Breakpoint, string>;

function getStyleClass(baseName: keyof typeof styles, breakpoint?: Breakpoint): string | undefined {
	const className = breakpoint ? `${String(baseName)}${breakpointSuffixes[breakpoint]}` : baseName;
	return styles[className as keyof typeof styles];
}

function getContainerModifierClasses(props: ResolvedFlexContainerProps, breakpoint?: Breakpoint): ClassName[] {
	const classes: ClassName[] = [];

	if (props.inline) classes.push(getStyleClass("inline", breakpoint));

	if (props.row) classes.push(getStyleClass("row", breakpoint));
	else if (props.column) classes.push(getStyleClass("column", breakpoint));
	else if (props.rowReverse) classes.push(getStyleClass("rowReverse", breakpoint));
	else if (props.columnReverse) classes.push(getStyleClass("columnReverse", breakpoint));

	if (props.wrap) classes.push(getStyleClass("wrap", breakpoint));
	else if (props.nowrap) classes.push(getStyleClass("nowrap", breakpoint));
	else if (props.wrapReverse) classes.push(getStyleClass("wrapReverse", breakpoint));

	if (props.align) {
		classes.push(
			getStyleClass(`align${props.align.charAt(0).toUpperCase() + props.align.slice(1)}` as keyof typeof styles, breakpoint)
		);
	}
	if (props.justify) {
		classes.push(
			getStyleClass(`justify${props.justify.charAt(0).toUpperCase() + props.justify.slice(1)}` as keyof typeof styles, breakpoint)
		);
	}
	if (props.alignContent) {
		classes.push(
			getStyleClass(
				`alignContent${props.alignContent.charAt(0).toUpperCase() + props.alignContent.slice(1)}` as keyof typeof styles,
				breakpoint
			)
		);
	}

	if (props.gap === "none") classes.push(getStyleClass("gapNone", breakpoint));
	else if (props.gap) {
		classes.push(getStyleClass(`gap${props.gap.charAt(0).toUpperCase() + props.gap.slice(1)}` as keyof typeof styles, breakpoint));
	}
	if (props.gapRow) {
		classes.push(
			getStyleClass(`gapRow${props.gapRow.charAt(0).toUpperCase() + props.gapRow.slice(1)}` as keyof typeof styles, breakpoint)
		);
	}
	if (props.gapColumn) {
		classes.push(
			getStyleClass(
				`gapColumn${props.gapColumn.charAt(0).toUpperCase() + props.gapColumn.slice(1)}` as keyof typeof styles,
				breakpoint
			)
		);
	}

	return classes;
}

function getItemModifierClasses(props: ResolvedFlexItemProps, breakpoint?: Breakpoint): ClassName[] {
	const classes: ClassName[] = [];

	if (props.flex0) classes.push(getStyleClass("flex0", breakpoint));
	if (props.flex1) classes.push(getStyleClass("flex1", breakpoint));

	if (!props.flex0 && !props.flex1) {
		classes.push(getStyleClass(props.grow ? "grow" : "grow0", breakpoint));
		classes.push(getStyleClass(props.shrink === false ? "shrink0" : "shrink", breakpoint));

		if (props.basis === "0") classes.push(getStyleClass("basis0", breakpoint));
		else if (props.basis === "auto") classes.push(getStyleClass("basisAuto", breakpoint));
	}

	if (props.alignSelf) {
		classes.push(
			getStyleClass(
				`alignSelf${props.alignSelf.charAt(0).toUpperCase() + props.alignSelf.slice(1)}` as keyof typeof styles,
				breakpoint
			)
		);
	}
	if (props.justifySelf) {
		classes.push(
			getStyleClass(
				`justifySelf${props.justifySelf.charAt(0).toUpperCase() + props.justifySelf.slice(1)}` as keyof typeof styles,
				breakpoint
			)
		);
	}

	return classes;
}

export function getFlexContainerClasses(props: FlexContainerLayoutProps): string {
	const values = CONTAINER_RESPONSIVE_KEYS.map((key) => props[key]);
	const classes: ClassName[] = [styles.container];

	if (!hasResponsiveLayoutValue(values)) {
		classes.push(...getContainerModifierClasses(resolveProps(props, "laptop", CONTAINER_RESPONSIVE_KEYS)));
		return classes.filter(Boolean).join(" ");
	}

	const propsByBreakpoint = resolveLayoutPropsForBreakpoints(props, CONTAINER_RESPONSIVE_KEYS);
	for (const breakpoint of RESPONSIVE_LAYOUT_BREAKPOINTS) {
		classes.push(...getContainerModifierClasses(propsByBreakpoint[breakpoint], breakpoint));
	}

	return classes.filter(Boolean).join(" ");
}

export function getFlexItemClasses(props: FlexItemLayoutProps): string {
	const values = ITEM_RESPONSIVE_KEYS.map((key) => props[key]);
	const classes: ClassName[] = [styles.item];

	if (!hasResponsiveLayoutValue(values)) {
		classes.push(...getItemModifierClasses(resolveProps(props, "laptop", ITEM_RESPONSIVE_KEYS)));
		return classes.filter(Boolean).join(" ");
	}

	const propsByBreakpoint = resolveLayoutPropsForBreakpoints(props, ITEM_RESPONSIVE_KEYS);
	for (const breakpoint of RESPONSIVE_LAYOUT_BREAKPOINTS) {
		classes.push(...getItemModifierClasses(propsByBreakpoint[breakpoint], breakpoint));
	}

	return classes.filter(Boolean).join(" ");
}

export function getFlexPredefinedClass(variant: string): string | undefined {
	return styles[variant as keyof typeof styles];
}
