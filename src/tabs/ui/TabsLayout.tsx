import {
	tabsLayoutTabDisplayName,
	tabsLayoutToolbarDisplayName,
	tabsLayoutContentDisplayName,
	tabsLayoutFooterDisplayName
} from "../lib/parseTabsLayoutChildren";
import { type TabsLayoutProps, type TabsLayoutSectionProps, type TabsLayoutTabProps } from "../model/types";

import { TabsLayoutView } from "./TabsLayoutView";

/**
 * Маркер верхнеуровневой вкладки в compound-режиме `TabsLayout`.
 */
function TabsLayoutTab({ children }: TabsLayoutTabProps) {
	return <>{children}</>;
}

TabsLayoutTab.displayName = tabsLayoutTabDisplayName;

/**
 * Верхняя секция панели, исключённая из прокручиваемого содержимого.
 */
function TabsLayoutToolbar({ children }: TabsLayoutSectionProps) {
	return <>{children}</>;
}

TabsLayoutToolbar.displayName = tabsLayoutToolbarDisplayName;

/**
 * Основное содержимое панели, которое само управляет своим layout и scroll.
 */
function TabsLayoutContent({ children }: TabsLayoutSectionProps) {
	return <>{children}</>;
}

TabsLayoutContent.displayName = tabsLayoutContentDisplayName;

/**
 * Нижняя секция панели, исключённая из прокручиваемого содержимого.
 */
function TabsLayoutFooter({ children }: TabsLayoutSectionProps) {
	return <>{children}</>;
}

TabsLayoutFooter.displayName = tabsLayoutFooterDisplayName;

/** Составная раскладка вкладок с независимо прокручиваемой активной панелью. */
export function TabsLayout(props: TabsLayoutProps) {
	return <TabsLayoutView {...props} />;
}

TabsLayout.Tab = TabsLayoutTab;
TabsLayout.Toolbar = TabsLayoutToolbar;
TabsLayout.Content = TabsLayoutContent;
TabsLayout.Footer = TabsLayoutFooter;
