import uiStyles from "./ui.module.scss";

import type { UiAppearance, UiPanelTone, UiTone, UiVariant } from "./types";

export type UiScheme = {
	tone: UiTone;
	appearance: UiAppearance;
};

export type UiSelectionAppearance = Extract<UiAppearance, "outline" | "solid">;

const variantSchemeMap: Record<UiVariant, UiScheme> = {
	neutral: { tone: "neutral", appearance: "solid" },
	neutralOutline: { tone: "neutral", appearance: "outline" },
	ghost: { tone: "neutral", appearance: "ghost" },
	brand: { tone: "brand", appearance: "solid" },
	error: { tone: "error", appearance: "solid" },
	warning: { tone: "warning", appearance: "solid" },
	success: { tone: "success", appearance: "solid" },
	info: { tone: "info", appearance: "solid" },
	brandOutline: { tone: "brand", appearance: "outline" },
	errorOutline: { tone: "error", appearance: "outline" },
	warningOutline: { tone: "warning", appearance: "outline" },
	successOutline: { tone: "success", appearance: "outline" },
	infoOutline: { tone: "info", appearance: "outline" },
	transparent: { tone: "neutral", appearance: "transparent" }
};

const toneClassNameMap: Record<UiTone, string> = {
	neutral: uiStyles.uiToneNeutral,
	brand: uiStyles.uiToneBrand,
	error: uiStyles.uiToneError,
	warning: uiStyles.uiToneWarning,
	success: uiStyles.uiToneSuccess,
	info: uiStyles.uiToneInfo
};

const appearanceClassNameMap: Record<UiAppearance, string> = {
	solid: uiStyles.uiAppearanceSolid,
	outline: uiStyles.uiAppearanceOutline,
	ghost: uiStyles.uiAppearanceGhost,
	transparent: uiStyles.uiAppearanceTransparent
};

const panelToneClassNameMap: Record<UiPanelTone, string> = {
	primary: uiStyles.uiPanelTonePrimary,
	secondary: uiStyles.uiPanelToneSecondary,
	tertiary: uiStyles.uiPanelToneTertiary
};

export function getUiToneClassName(tone: UiTone): string {
	return toneClassNameMap[tone];
}

export function getUiAppearanceClassName(appearance: UiAppearance): string {
	return appearanceClassNameMap[appearance];
}

export function getUiPanelToneClassName(tone: UiPanelTone): string {
	return panelToneClassNameMap[tone];
}

export function resolveUiScheme({
	variant,
	tone,
	appearance,
	fallbackTone = "neutral",
	fallbackAppearance = "outline"
}: {
	variant?: UiVariant;
	tone?: UiTone;
	appearance?: UiAppearance;
	fallbackTone?: UiTone;
	fallbackAppearance?: UiAppearance;
}): UiScheme {
	if (tone || appearance) {
		return {
			tone: tone ?? fallbackTone,
			appearance: appearance ?? fallbackAppearance
		};
	}

	if (variant) {
		return variantSchemeMap[variant];
	}

	return {
		tone: fallbackTone,
		appearance: fallbackAppearance
	};
}
