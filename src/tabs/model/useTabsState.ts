import type React from "react";
import { FocusEvent, KeyboardEvent, useId, useMemo, useRef, useState } from "react";

import { getRovingFocusTargetIndex } from "@ryuzaki13/react-foundation-lib/utils";

import { getEnabledTabs, getSafeTabId } from "../lib/tabs";

import type { TabsActivationMode, TabsDescriptor, TabsOrientation } from "./types";

interface UseTabsStateOptions {
	items: TabsDescriptor[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	orientation?: TabsOrientation;
	activationMode?: TabsActivationMode;
	loop?: boolean;
}

/**
 * Публичная часть модели, необходимая визуальным подкомпонентам tabs.
 */
export interface TabsStateModel {
	activationMode: TabsActivationMode;
	orientation: TabsOrientation;
	selectedTabId: string | null;
	tabbableTabId: string | null;
	onTabListKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
	onTabListBlur: (event: FocusEvent<HTMLDivElement>) => void;
	getTabElementId: (tabId: string) => string;
	getPanelElementId: (tabId: string) => string;
	getTabButtonProps: (item: TabsDescriptor) => React.ButtonHTMLAttributes<HTMLButtonElement> & {
		ref: (node: HTMLButtonElement | null) => void;
	};
	isVisited: (tabId: string) => boolean;
}

/**
 * Инкапсулирует state, a11y-связки и клавиатурную навигацию для всех оболочек tabs.
 */
export function useTabsState({
	items,
	value,
	defaultValue,
	onValueChange,
	orientation = "horizontal",
	activationMode = "automatic",
	loop = true
}: UseTabsStateOptions): TabsStateModel {
	const isControlled = value !== undefined;
	const enabledTabs = useMemo(() => getEnabledTabs(items), [items]);
	const fallbackTabId = enabledTabs[0]?.id ?? null;
	const [internalValue, setInternalValue] = useState(() => getSafeTabId(items, defaultValue));
	const [focusedTabId, setFocusedTabId] = useState<string | null>(() => getSafeTabId(items, value ?? defaultValue));
	const initialVisitedTabId = getSafeTabId(items, value ?? defaultValue);
	const [visitedTabsState, setVisitedTabsState] = useState<Set<string>>(() =>
		initialVisitedTabId ? new Set([initialVisitedTabId]) : new Set()
	);
	const tabsId = useId();
	const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	const selectedTabId = getSafeTabId(items, isControlled ? value : internalValue);
	const nextTabbableTabId = getSafeTabId(items, focusedTabId) ?? selectedTabId ?? fallbackTabId;
	const visitedTabs = useMemo(() => {
		if (!selectedTabId || visitedTabsState.has(selectedTabId)) {
			return visitedTabsState;
		}

		const next = new Set(visitedTabsState);
		next.add(selectedTabId);
		return next;
	}, [selectedTabId, visitedTabsState]);

	const activateTab = (nextTabId: string) => {
		const safeNextTabId = getSafeTabId(items, nextTabId);
		if (!safeNextTabId) {
			return;
		}

		setVisitedTabsState((prev) => {
			if (prev.has(safeNextTabId)) {
				return prev;
			}

			const next = new Set(prev);
			next.add(safeNextTabId);
			return next;
		});

		if (!isControlled) {
			setInternalValue(safeNextTabId);
		}

		onValueChange?.(safeNextTabId);
	};

	const focusTab = (nextTabId: string) => {
		tabRefs.current[nextTabId]?.focus();
	};

	const onTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (enabledTabs.length < 2) {
			return;
		}

		const activeFocusIndex = Math.max(
			0,
			enabledTabs.findIndex((item) => item.id === (nextTabbableTabId ?? selectedTabId ?? fallbackTabId))
		);
		const nextEnabledIndex = getRovingFocusTargetIndex({
			currentIndex: activeFocusIndex,
			itemCount: enabledTabs.length,
			key: event.key,
			orientation,
			wrap: loop
		});

		if (nextEnabledIndex === null) {
			return;
		}

		event.preventDefault();

		const nextTabId = enabledTabs[nextEnabledIndex]?.id;
		if (!nextTabId) {
			return;
		}

		setFocusedTabId(nextTabId);
		focusTab(nextTabId);

		if (activationMode === "automatic") {
			activateTab(nextTabId);
		}
	};

	const onTabListBlur = (event: FocusEvent<HTMLDivElement>) => {
		const nextTarget = event.relatedTarget;

		if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
			return;
		}

		setFocusedTabId(selectedTabId ?? fallbackTabId);
	};

	const getTabElementId = (tabId: string) => `${tabsId}-tab-${tabId}`;
	const getPanelElementId = (tabId: string) => `${tabsId}-panel-${tabId}`;

	const getTabButtonProps = (item: TabsDescriptor) => {
		const isSelected = item.id === selectedTabId;
		const isTabbable = item.id === nextTabbableTabId;

		return {
			ref: (node: HTMLButtonElement | null) => {
				tabRefs.current[item.id] = node;
			},
			type: "button" as const,
			role: "tab" as const,
			id: getTabElementId(item.id),
			disabled: item.disabled,
			"aria-selected": isSelected,
			"aria-controls": getPanelElementId(item.id),
			"aria-disabled": item.disabled || undefined,
			tabIndex: item.disabled ? -1 : isTabbable ? 0 : -1,
			onFocus: () => setFocusedTabId(item.id),
			onClick: () => activateTab(item.id)
		};
	};

	return {
		activationMode,
		orientation,
		selectedTabId,
		tabbableTabId: nextTabbableTabId,
		onTabListKeyDown,
		onTabListBlur,
		getTabElementId,
		getPanelElementId,
		getTabButtonProps,
		isVisited: (tabId: string) => visitedTabs.has(tabId)
	};
}
