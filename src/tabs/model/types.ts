import { type ReactNode } from "react";

import { UiPanelTone } from "../../types";

/**
 * Направление списка вкладок.
 */
export type TabsOrientation = "horizontal" | "vertical";

/**
 * Режим клавиатурной активации вкладок.
 */
export type TabsActivationMode = "automatic" | "manual";

/**
 * Стратегия монтирования панелей вкладок.
 */
export type TabsMountStrategy = "unmount" | "lazy" | "keep-mounted";

/**
 * Базовое описание вкладки для управления состоянием и доступностью.
 */
export interface TabsDescriptor {
	id: string;
	title: ReactNode;
	disabled?: boolean;
}

/**
 * Общие пропсы поведения для визуальных оболочек tabs-компонентов.
 */
export interface TabsCommonProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	orientation?: TabsOrientation;
	activationMode?: TabsActivationMode;
	mountStrategy?: TabsMountStrategy;
	loop?: boolean;
	tone?: UiPanelTone;
	clean?: boolean;
	className?: string;
	"aria-label"?: string;
	"aria-labelledby"?: string;
}

/**
 * Элемент данных для простого сценария `TabsBox`.
 */
export interface TabsBoxItem extends TabsDescriptor {
	content: ReactNode;
}

/**
 * Публичный API для простого items-based сценария tabs.
 */
export interface TabsBoxProps extends TabsCommonProps {
	items: TabsBoxItem[];
	isLoading?: boolean;
	loadingText?: string;
}

/**
 * Пропсы секций compound-режима `TabsLayout`.
 */
export interface TabsLayoutSectionProps {
	children: ReactNode;
	className?: string;
}

/**
 * Описание одной вкладки в compound-режиме `TabsLayout`.
 */
export interface TabsLayoutTabProps extends TabsDescriptor {
	children: ReactNode;
}

/**
 * Публичный API для compound-сценария `TabsLayout`.
 */
export interface TabsLayoutProps extends TabsCommonProps {
	children: ReactNode;
}
