import type { CSSProperties } from "react";

import {
	type Breakpoint,
	isResponsiveMap,
	resolveProps,
	type ResolvedProps,
	type ResponsiveValue
} from "@ryuzaki13/react-foundation-lib/media";

import {
	hasResponsiveLayoutValue,
	RESPONSIVE_LAYOUT_BREAKPOINTS,
	resolveLayoutPropsForBreakpoints,
	resolveLayoutValueForBreakpoints
} from "../responsive-layout/responsiveLayout";

import styles from "./Grid.module.scss";

import type { GridContainerLayoutProps, GridItemLayoutProps } from "./types";

type ClassName = string | undefined | null | false;
type ResolvedGridContainerProps = ResolvedProps<GridContainerLayoutProps>;
type ResolvedGridItemProps = ResolvedProps<GridItemLayoutProps>;
type ResponsiveCSSProperties = CSSProperties & Record<`--foundation-grid-${string}`, string | number | undefined>;

type ResponsiveStyleResult = {
	className?: string;
	style: CSSProperties;
};

const CONTAINER_CLASS_KEYS = [
	"inline",
	"row",
	"column",
	"dense",
	"gap",
	"gapRow",
	"gapColumn",
	"align",
	"justify",
	"alignContent",
	"justifyContent",
	"variant"
] as const satisfies readonly (keyof GridContainerLayoutProps)[];

const ITEM_CLASS_KEYS = ["alignSelf", "justifySelf"] as const satisfies readonly (keyof GridItemLayoutProps)[];

const breakpointSuffixes = {
	mobile: "Mobile",
	tablet: "Tablet",
	laptop: "Laptop"
} as const satisfies Record<Breakpoint, string>;

function getStyleClass(baseName: string, breakpoint?: Breakpoint): string | undefined {
	const className = breakpoint ? `${String(baseName)}${breakpointSuffixes[breakpoint]}` : baseName;
	return styles[className as keyof typeof styles];
}

function getContainerModifierClasses(props: ResolvedGridContainerProps, breakpoint?: Breakpoint): ClassName[] {
	const classes: ClassName[] = [];

	if (props.inline) classes.push(getStyleClass("inline", breakpoint));

	if (props.column) classes.push(getStyleClass("column", breakpoint));
	else if (props.dense) classes.push(getStyleClass("dense", breakpoint));
	else if (props.row) classes.push(getStyleClass("row", breakpoint));

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
	if (props.justifyContent) {
		classes.push(
			getStyleClass(
				`justifyContent${props.justifyContent.charAt(0).toUpperCase() + props.justifyContent.slice(1)}` as keyof typeof styles,
				breakpoint
			)
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

	if (props.variant === "single-column") classes.push(getStyleClass("singleColumn", breakpoint));
	else if (props.variant === "auto-1fr") classes.push(getStyleClass("autoRows1fr", breakpoint));
	else if (props.variant === "auto1fr-rows-auto") classes.push(getStyleClass("columnsAuto1fr", breakpoint));

	return classes;
}

function getItemModifierClasses(props: ResolvedGridItemProps, breakpoint?: Breakpoint): ClassName[] {
	const classes: ClassName[] = [];

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

function setResponsiveStyle<T extends string | number>(
	target: ResponsiveCSSProperties,
	property: keyof CSSProperties,
	variableName: string,
	value: ResponsiveValue<T> | undefined,
	responsiveClassName: string
): string | undefined {
	if (value === undefined) return undefined;

	if (!isResponsiveMap(value)) {
		Object.assign(target, { [property]: value });
		return undefined;
	}

	const values = resolveLayoutValueForBreakpoints(value);
	for (const breakpoint of RESPONSIVE_LAYOUT_BREAKPOINTS) {
		target[`--foundation-grid-${variableName}-${breakpoint}`] = values[breakpoint];
	}
	return getStyleClass(responsiveClassName);
}

export function getGridContainerClasses(props: GridContainerLayoutProps): string {
	const values = CONTAINER_CLASS_KEYS.map((key) => props[key]);
	const classes: ClassName[] = [styles.grid];

	if (!hasResponsiveLayoutValue(values)) {
		classes.push(...getContainerModifierClasses(resolveProps(props, "laptop", CONTAINER_CLASS_KEYS)));
		return classes.filter(Boolean).join(" ");
	}

	const propsByBreakpoint = resolveLayoutPropsForBreakpoints(props, CONTAINER_CLASS_KEYS);
	for (const breakpoint of RESPONSIVE_LAYOUT_BREAKPOINTS) {
		classes.push(...getContainerModifierClasses(propsByBreakpoint[breakpoint], breakpoint));
	}

	return classes.filter(Boolean).join(" ");
}

export function getGridContainerStyles(
	props: Pick<GridContainerLayoutProps, "templateColumns" | "templateRows" | "autoColumns" | "autoRows" | "areas">
): ResponsiveStyleResult {
	const style: ResponsiveCSSProperties = {};
	const classes = [
		setResponsiveStyle(style, "gridTemplateColumns", "template-columns", props.templateColumns, "responsiveTemplateColumns"),
		setResponsiveStyle(style, "gridTemplateRows", "template-rows", props.templateRows, "responsiveTemplateRows"),
		setResponsiveStyle(style, "gridAutoColumns", "auto-columns", props.autoColumns, "responsiveAutoColumns"),
		setResponsiveStyle(style, "gridAutoRows", "auto-rows", props.autoRows, "responsiveAutoRows"),
		setResponsiveStyle(style, "gridTemplateAreas", "template-areas", props.areas, "responsiveTemplateAreas")
	];

	return { className: classes.filter(Boolean).join(" ") || undefined, style };
}

export function getGridItemClasses(props: GridItemLayoutProps): string {
	const values = ITEM_CLASS_KEYS.map((key) => props[key]);
	const classes: ClassName[] = [styles.item];

	if (!hasResponsiveLayoutValue(values)) {
		classes.push(...getItemModifierClasses(resolveProps(props, "laptop", ITEM_CLASS_KEYS)));
		return classes.filter(Boolean).join(" ");
	}

	const propsByBreakpoint = resolveLayoutPropsForBreakpoints(props, ITEM_CLASS_KEYS);
	for (const breakpoint of RESPONSIVE_LAYOUT_BREAKPOINTS) {
		classes.push(...getItemModifierClasses(propsByBreakpoint[breakpoint], breakpoint));
	}

	return classes.filter(Boolean).join(" ");
}

export function getGridItemStyles(props: Pick<GridItemLayoutProps, "area" | "column" | "row">): ResponsiveStyleResult {
	const style: ResponsiveCSSProperties = {};
	const classes = [
		setResponsiveStyle(style, "gridArea", "area", props.area, "responsiveArea"),
		setResponsiveStyle(style, "gridColumn", "column", props.column, "responsiveColumn"),
		setResponsiveStyle(style, "gridRow", "row", props.row, "responsiveRow")
	];

	return { className: classes.filter(Boolean).join(" ") || undefined, style };
}
