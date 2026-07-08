import { XIcon } from "lucide-react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { TextOverflow } from "../text";
import { getUiAppearanceClassName, getUiToneClassName, resolveUiScheme } from "../uiClasses";

import styles from "./Badge.module.scss";

import type { UiAppearance, UiSize, UiTone } from "../types";

type BadgeSize = UiSize;
type BadgeAppearance = UiAppearance;

type BadgeProps = {
	children: string | number;
	size?: BadgeSize;
	tone?: UiTone;
	appearance?: BadgeAppearance;
	className?: string;
	onRemove?: () => void;
};

const sizeClasses: Record<BadgeSize, string> = {
	xs: styles.sizeXs,
	sm: styles.sizeSm,
	md: styles.sizeMd,
	lg: styles.sizeLg,
	xl: styles.sizeXl
};

/**
 * Компактный индикатор для статусов, категорий и коротких служебных меток.
 */
export function Badge({ children, size = "sm", tone, appearance, className, onRemove }: BadgeProps) {
	const fallbackTone = tone ?? "neutral";
	const fallbackAppearance = fallbackTone !== "neutral" ? "solid" : "outline";
	const scheme = resolveUiScheme({
		tone,
		appearance,
		fallbackTone,
		fallbackAppearance
	});

	return (
		<div
			className={cn(
				styles.badge,
				sizeClasses[size],
				getUiToneClassName(scheme.tone),
				getUiAppearanceClassName(scheme.appearance),
				!onRemove && styles.passive,
				className
			)}>
			<TextOverflow maxChar={25} placement="top" block textWrapProps={{ className: styles.content }}>
				{String(children)}
			</TextOverflow>
			{onRemove && (
				<button
					type="button"
					onClick={onRemove}
					className={styles.removeButton}
					aria-label="Удалить бейдж"
					data-ui="badge-remove-button"
					data-action="remove-badge">
					<XIcon />
				</button>
			)}
		</div>
	);
}
