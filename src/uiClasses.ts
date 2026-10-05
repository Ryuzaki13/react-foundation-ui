import uiStyles from "./ui.module.scss";

import type { UiAppearance, UiPanelTone, UiTone } from "./types";

export type UiScheme = {
	tone: UiTone;
	appearance: UiAppearance | undefined;
};

export type UiSelectionAppearance = Extract<UiAppearance, "outline" | "solid">;

const toneClassNameMap: Record<UiTone, string> = Object.freeze({
	accent: uiStyles.uiToneAccent,
	neutral: uiStyles.uiToneNeutral,
	brand: uiStyles.uiToneBrand,
	error: uiStyles.uiToneError,
	warning: uiStyles.uiToneWarning,
	success: uiStyles.uiToneSuccess,
	info: uiStyles.uiToneInfo
});

const appearanceClassNameMap: Record<UiAppearance, string> = Object.freeze({
	solid: uiStyles.uiAppearanceSolid,
	outline: uiStyles.uiAppearanceOutline,
	ghost: uiStyles.uiAppearanceGhost,
	transparent: uiStyles.uiAppearanceTransparent
});

const panelToneClassNameMap: Record<UiPanelTone, string> = Object.freeze({
	primary: uiStyles.uiPanelTonePrimary,
	secondary: uiStyles.uiPanelToneSecondary,
	tertiary: uiStyles.uiPanelToneTertiary
});

export function getUiToneClassName(tone: UiTone): string {
	return toneClassNameMap[tone];
}

export function getUiAppearanceClassName(appearance: UiAppearance | undefined): string | undefined {
	return appearance && appearanceClassNameMap[appearance];
}

export function getUiPanelToneClassName(tone: UiPanelTone): string {
	return panelToneClassNameMap[tone];
}

export function resolveUiScheme({
	tone,
	appearance,
	fallbackTone = "neutral",
	fallbackAppearance = "outline"
}: {
	tone?: UiTone;
	appearance?: UiAppearance;
	fallbackTone?: UiTone;
	fallbackAppearance?: UiAppearance;
}): UiScheme {
	if (tone || appearance) {
		const resolvedTone = tone ?? fallbackTone;
		const resolvedAppearance = appearance ?? fallbackAppearance;

		if (resolvedAppearance === "ghost" || resolvedAppearance === "transparent") {
			return {
				tone: "neutral",
				appearance: resolvedAppearance
			};
		}

		return {
			tone: resolvedTone,
			appearance: resolvedAppearance
		};
	}

	return {
		tone: fallbackTone,
		appearance: undefined
	};
}
