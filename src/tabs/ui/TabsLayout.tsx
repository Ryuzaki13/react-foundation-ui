/* eslint-disable react-refresh/only-export-components */
import React, { Children, isValidElement, useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { shouldMountTabPanel } from "../lib/tabs";
import { useTabsState } from "../model/useTabsState";

import styles from "./Tabs.module.scss";
import { TabsPanel } from "./TabsPanel";
import { TabsTabList } from "./TabsTabList";

import type { TabsDescriptor, TabsLayoutProps, TabsLayoutSectionProps, TabsLayoutTabProps } from "../model/types";

interface ParsedTabsLayoutTab extends TabsDescriptor {
	toolbar: TabsLayoutSectionProps | null;
	content: TabsLayoutSectionProps;
	footer: TabsLayoutSectionProps | null;
}

const tabsLayoutTabDisplayName = "TabsLayout.Tab";
const tabsLayoutToolbarDisplayName = "TabsLayout.Toolbar";
const tabsLayoutContentDisplayName = "TabsLayout.Content";
const tabsLayoutFooterDisplayName = "TabsLayout.Footer";

/**
 * Возвращает стабильный displayName compound-элемента.
 * Это нужно для корректной работы HMR, где ссылочное сравнение `child.type` может ломаться.
 */
function getTabsLayoutElementDisplayName(child: React.ReactElement) {
	const { type } = child;

	if (typeof type === "function") {
		const componentType = type as React.JSXElementConstructor<unknown> & {
			displayName?: string;
			name?: string;
		};

		return componentType.displayName ?? componentType.name ?? null;
	}

	if (typeof type === "object" && type !== null && "displayName" in type) {
		const componentType = type as {
			displayName?: string;
		};

		return typeof componentType.displayName === "string" ? componentType.displayName : null;
	}

	return null;
}

function isTabsLayoutElement<Props>(child: React.ReactNode, displayName: string): child is React.ReactElement<Props> {
	return isValidElement<Props>(child) && getTabsLayoutElementDisplayName(child) === displayName;
}

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

function parseTabsLayoutSections(children: React.ReactNode, tabId: string) {
	let toolbar: TabsLayoutSectionProps | null = null;
	let content: TabsLayoutSectionProps | null = null;
	let footer: TabsLayoutSectionProps | null = null;

	for (const child of Children.toArray(children)) {
		if (!isValidElement(child)) {
			throw new Error(
				`TabsLayout.Tab "${tabId}" поддерживает только дочерние элементы TabsLayout.Toolbar, TabsLayout.Content и TabsLayout.Footer.`
			);
		}

		if (isTabsLayoutElement<TabsLayoutSectionProps>(child, tabsLayoutToolbarDisplayName)) {
			if (toolbar) {
				throw new Error(`TabsLayout.Tab "${tabId}" содержит более одного блока TabsLayout.Toolbar.`);
			}

			toolbar = child.props;
			continue;
		}

		if (isTabsLayoutElement<TabsLayoutSectionProps>(child, tabsLayoutContentDisplayName)) {
			if (content) {
				throw new Error(`TabsLayout.Tab "${tabId}" содержит более одного блока TabsLayout.Content.`);
			}

			content = child.props;
			continue;
		}

		if (isTabsLayoutElement<TabsLayoutSectionProps>(child, tabsLayoutFooterDisplayName)) {
			if (footer) {
				throw new Error(`TabsLayout.Tab "${tabId}" содержит более одного блока TabsLayout.Footer.`);
			}

			footer = child.props;
			continue;
		}

		throw new Error(
			`TabsLayout.Tab "${tabId}" поддерживает только дочерние элементы TabsLayout.Toolbar, TabsLayout.Content и TabsLayout.Footer.`
		);
	}

	if (!content) {
		throw new Error(`TabsLayout.Tab "${tabId}" должен содержать блок TabsLayout.Content.`);
	}

	return { toolbar, content, footer };
}

function parseTabsLayoutChildren(children: React.ReactNode): ParsedTabsLayoutTab[] {
	return Children.toArray(children).map((child) => {
		if (!isTabsLayoutElement<TabsLayoutTabProps>(child, tabsLayoutTabDisplayName)) {
			throw new Error("TabsLayout принимает только дочерние элементы TabsLayout.Tab.");
		}

		return {
			id: child.props.id,
			title: child.props.title,
			disabled: child.props.disabled,
			...parseTabsLayoutSections(child.props.children, child.props.id)
		};
	});
}

type TabsLayoutComposition = React.FC<TabsLayoutProps> & {
	Tab: typeof TabsLayoutTab;
	Toolbar: typeof TabsLayoutToolbar;
	Content: typeof TabsLayoutContent;
	Footer: typeof TabsLayoutFooter;
};

/**
 * Compound-оболочка tabs для составных panel-layout сценариев.
 * Сам компонент управляет только переключением и каркасом панели.
 */
const TabsLayoutRoot: React.FC<TabsLayoutProps> = ({
	children,
	value,
	defaultValue,
	onValueChange,
	className,
	bordered,
	cleanPanel,
	orientation = "horizontal",
	activationMode = "manual",
	mountStrategy = "lazy",
	loop = true,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy
}) => {
	const tabs = useMemo(() => parseTabsLayoutChildren(children), [children]);
	const state = useTabsState({
		items: tabs,
		value,
		defaultValue,
		onValueChange,
		orientation,
		activationMode,
		loop
	});
	const rootClassName = cn(
		styles.tabsContainer,
		styles[orientation],
		bordered && styles.bordered,
		cleanPanel && styles.cleanPanel,
		className
	);
	const panelsClassName = cn(styles.panels, styles.layoutPanels);

	return (
		<div className={rootClassName}>
			<TabsTabList items={tabs} state={state} className={styles.tabs} ariaLabel={ariaLabel} ariaLabelledBy={ariaLabelledBy} />

			<div className={panelsClassName}>
				{tabs.map((tab) => {
					const isSelected = tab.id === state.selectedTabId;
					const isMounted = shouldMountTabPanel({
						mountStrategy,
						isSelected,
						isVisited: state.isVisited(tab.id)
					});

					if (!isMounted) {
						return null;
					}

					const templateRows = `${tab.toolbar ? "auto " : ""}minmax(0, 1fr)${tab.footer ? " auto" : ""}`;

					return (
						<TabsPanel
							key={tab.id}
							tabId={tab.id}
							isSelected={isSelected}
							className={styles.panel}
							getTabElementId={state.getTabElementId}
							getPanelElementId={state.getPanelElementId}>
							<div className={styles.layoutPanel} style={{ gridTemplateRows: templateRows }}>
								{tab.toolbar ? (
									<div className={cn(styles.layoutSection, tab.toolbar.className)}>{tab.toolbar.children}</div>
								) : null}
								<div className={cn(styles.layoutSection, styles.layoutContent, tab.content.className)}>
									{tab.content.children}
								</div>
								{tab.footer ? (
									<div className={cn(styles.layoutSection, tab.footer.className)}>{tab.footer.children}</div>
								) : null}
							</div>
						</TabsPanel>
					);
				})}
			</div>
		</div>
	);
};

TabsLayoutRoot.displayName = "TabsLayout";

export const TabsLayout = Object.assign(TabsLayoutRoot, {
	Tab: TabsLayoutTab,
	Toolbar: TabsLayoutToolbar,
	Content: TabsLayoutContent,
	Footer: TabsLayoutFooter
}) as TabsLayoutComposition;
