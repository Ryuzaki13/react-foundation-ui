import uiStyles from "./ui.module.scss";
import {
	UI_APPEARANCE_GHOST,
	UI_APPEARANCE_OUTLINE,
	UI_APPEARANCE_SOLID,
	UI_PANEL_TONE_ELEVATED,
	UI_PANEL_TONE_SUNKEN,
	UI_PANEL_TONE_SURFACE,
	UI_TONE_ACCENT,
	UI_TONE_ERROR,
	UI_TONE_INFO,
	UI_TONE_NEUTRAL,
	UI_TONE_SUCCESS,
	UI_TONE_WARNING
} from "./uiSchemeConstants";

import type { UiAppearance, UiPanelTone, UiTone } from "./types";

export type UiScheme = {
	tone: UiTone;
	appearance: UiAppearance | undefined;
};

export type UiSelectionAppearance = Extract<UiAppearance, typeof UI_APPEARANCE_OUTLINE | typeof UI_APPEARANCE_SOLID>;

const toneClassNameMap: Record<UiTone, string> = Object.freeze({
	[UI_TONE_ACCENT]: uiStyles.uiToneAccent,
	[UI_TONE_NEUTRAL]: uiStyles.uiToneNeutral,
	[UI_TONE_ERROR]: uiStyles.uiToneError,
	[UI_TONE_WARNING]: uiStyles.uiToneWarning,
	[UI_TONE_SUCCESS]: uiStyles.uiToneSuccess,
	[UI_TONE_INFO]: uiStyles.uiToneInfo
});

const appearanceClassNameMap: Record<UiAppearance, string> = Object.freeze({
	[UI_APPEARANCE_SOLID]: uiStyles.uiAppearanceSolid,
	[UI_APPEARANCE_OUTLINE]: uiStyles.uiAppearanceOutline,
	[UI_APPEARANCE_GHOST]: uiStyles.uiAppearanceGhost
});

const panelToneClassNameMap: Record<UiPanelTone, string> = Object.freeze({
	[UI_PANEL_TONE_SURFACE]: uiStyles.uiPanelToneSurface,
	[UI_PANEL_TONE_ELEVATED]: uiStyles.uiPanelToneElevated,
	[UI_PANEL_TONE_SUNKEN]: uiStyles.uiPanelToneSunken
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

export function resolveUiTone(tone: UiTone = UI_TONE_NEUTRAL): UiTone {
	return tone;
}

export function resolveUiScheme({
	tone,
	appearance,
	fallbackTone = UI_TONE_NEUTRAL,
	fallbackAppearance = UI_APPEARANCE_OUTLINE
}: {
	tone?: UiTone;
	appearance?: UiAppearance;
	fallbackTone?: UiTone;
	fallbackAppearance?: UiAppearance;
}): UiScheme {
	if (tone || appearance) {
		const resolvedTone = tone ?? fallbackTone;
		const resolvedAppearance = appearance ?? fallbackAppearance;

		if (resolvedAppearance === UI_APPEARANCE_GHOST) {
			return {
				tone: resolvedTone,
				appearance: resolvedAppearance
			};
		}

		return {
			tone: resolvedTone,
			appearance: resolvedTone === UI_TONE_NEUTRAL ? undefined : resolvedAppearance
		};
	}

	return {
		tone: fallbackTone,
		appearance: undefined
	};
}
