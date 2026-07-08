import React, { CSSProperties, useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextColor = "primary" | "secondary" | "muted" | "error" | "warning" | "success" | "info";
export type TextWeight = "lighter" | "light" | "regular" | "medium" | "bold" | "bolder";
export type TextWrap = "wrap" | "noWrap";

const textColors: Record<TextColor, string> = {
	primary: "content0",
	secondary: "content1",
	muted: "content2",
	info: "statusInfo",
	success: "statusSuccess",
	warning: "statusWarning",
	error: "statusError"
};

const textSizes: Record<TextSize, string> = {
	xs: "fontSizeXs",
	sm: "fontSizeSm",
	md: "fontSizeMd",
	lg: "fontSizeLg",
	xl: "fontSizeXl"
};

const textWeights: Record<TextWeight, string> = {
	lighter: "fontLighter",
	light: "fontLight",
	regular: "fontRegular",
	medium: "fontMedium",
	bold: "fontBold",
	bolder: "fontBolder"
};

const textWraps: Record<TextWrap, string> = {
	wrap: "textWrap",
	noWrap: "textNoWrap"
};

interface BaseTextProps {
	size?: TextSize;
	color?: TextColor;
	weight?: TextWeight;
	italic?: boolean;
	uppercase?: boolean;
	wrap?: TextWrap;
	className?: string;
	style?: CSSProperties;
}

interface TextProps extends BaseTextProps {
	children: React.ReactNode;
	as?: "code" | "span" | "p" | "div" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const useTextStyles = ({ size, color, weight, italic, uppercase, wrap, className }: BaseTextProps) => {
	return useMemo(() => {
		const classes: string[] = [];

		if (size) {
			classes.push(textSizes[size]);
		}

		if (weight) {
			classes.push(textWeights[weight]);
		}

		if (wrap) {
			classes.push(textWraps[wrap]);
		}

		if (italic) classes.push("fontItalic");
		if (uppercase) classes.push("textUppercase");

		if (color) {
			classes.push(textColors[color]);
		}

		return cn(...classes, className);
	}, [size, weight, color, italic, uppercase, wrap, className]);
};

export const Text: React.FC<TextProps> = ({ children, as, style, ...props }) => {
	const classes = useTextStyles(props);
	const Component = as || "span";

	return (
		<Component className={classes} style={style}>
			{children}
		</Component>
	);
};
