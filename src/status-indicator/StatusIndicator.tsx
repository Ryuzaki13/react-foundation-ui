import type { HTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./StatusIndicator.module.scss";

import type { UiSize, UiTone } from "../types";

export type StatusIndicatorTone = Exclude<UiTone, "brand">;
export type StatusIndicatorSize = Extract<UiSize, "sm" | "md" | "lg">;

export interface StatusIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	tone?: StatusIndicatorTone;
	size?: StatusIndicatorSize;
	animated?: boolean;
}

const toneClasses: Record<StatusIndicatorTone, string> = {
	neutral: styles.neutral,
	info: styles.info,
	success: styles.success,
	warning: styles.warning,
	error: styles.error
};

const sizeClasses: Record<StatusIndicatorSize, string> = {
	sm: styles.sizeSm,
	md: styles.sizeMd,
	lg: styles.sizeLg
};

/**
 * Декоративный цветовой маркер статуса. Передавайте смысл состояния видимым текстом рядом с индикатором.
 */
export function StatusIndicator({ tone = "neutral", size = "md", animated = false, className, ...htmlProps }: StatusIndicatorProps) {
	const hasAccessibleSemantics =
		htmlProps.role !== undefined || htmlProps["aria-label"] !== undefined || htmlProps["aria-labelledby"] !== undefined;
	const ariaHidden = htmlProps["aria-hidden"] ?? (hasAccessibleSemantics ? undefined : true);

	return (
		<span
			{...htmlProps}
			className={cn(styles.statusIndicator, toneClasses[tone], sizeClasses[size], animated && styles.animated, className)}
			aria-hidden={ariaHidden}
			data-ui="status-indicator"
		/>
	);
}
