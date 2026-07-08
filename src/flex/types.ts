import { CSSProperties, JSX } from "react";

import { ResponsiveValue } from "@ryuzaki13/react-foundation-lib/media";

export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify = "start" | "center" | "end" | "stretch" | "between" | "around" | "evenly";
export type FlexGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type FlexBasis = "0" | "auto";

export interface FlexContainerProps {
	/** Тип display `flex | inline-flex` */
	inline?: ResponsiveValue<boolean>;

	/** Направление flex-контейнера */
	row?: ResponsiveValue<boolean>;
	column?: ResponsiveValue<boolean>;
	rowReverse?: ResponsiveValue<boolean>;
	columnReverse?: ResponsiveValue<boolean>;

	/** Перенос элементов */
	wrap?: ResponsiveValue<boolean>;
	nowrap?: ResponsiveValue<boolean>;
	wrapReverse?: ResponsiveValue<boolean>;

	/** Выравнивание по поперечной оси */
	align?: ResponsiveValue<FlexAlign>;

	/** Выравнивание по главной оси */
	justify?: ResponsiveValue<FlexJustify>;

	/** Выравнивание контента */
	alignContent?: ResponsiveValue<FlexJustify>;

	/** Gap */
	gap?: ResponsiveValue<FlexGap>;
	/** Row gap */
	gapRow?: ResponsiveValue<Exclude<FlexGap, "none">>;
	/** Column gap */
	gapColumn?: ResponsiveValue<Exclude<FlexGap, "none">>;

	/** Дочерние элементы */
	children: React.ReactNode;

	/** CSS класс */
	className?: string;

	/** HTML тег */
	as?: keyof JSX.IntrinsicElements;

	/** Inline styles */
	style?: CSSProperties;
}

export interface FlexItemProps {
	/**
	 * Способность расти
	 * @default false = 0
	 */
	grow?: ResponsiveValue<boolean>;

	/**
	 * Способность сжиматься
	 * @default true = 1
	 */
	shrink?: ResponsiveValue<boolean>;

	/** Использовать составной класс flex0 */
	flex0?: ResponsiveValue<boolean>;
	/** Использовать составной класс flex1 */
	flex1?: ResponsiveValue<boolean>;

	/** Базовый размер */
	basis?: ResponsiveValue<FlexBasis>;

	/** Выравнивание отдельного элемента */
	alignSelf?: ResponsiveValue<FlexAlign>;

	/** Justify-self для grid-like выравнивания */
	justifySelf?: ResponsiveValue<Exclude<FlexJustify, "between" | "around" | "evenly">>;

	/** Дочерние элементы */
	children?: React.ReactNode;

	/** CSS класс */
	className?: string;

	/** HTML тег */
	as?: keyof JSX.IntrinsicElements;

	/** Inline styles */
	style?: CSSProperties;
}

export interface PredefinedFlexProps extends Omit<FlexContainerProps, "row" | "column" | "rowReverse" | "columnReverse"> {
	variant?: "center" | "centerBetween" | "columnCenter";
}
