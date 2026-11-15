import { Children, isValidElement, type ReactElement, type ReactNode, type JSXElementConstructor } from "react";

import { type TabsDescriptor, type TabsLayoutSectionProps, type TabsLayoutTabProps } from "../model/types";

interface ParsedTabsLayoutTab extends TabsDescriptor {
	toolbar: TabsLayoutSectionProps | null;
	content: TabsLayoutSectionProps;
	footer: TabsLayoutSectionProps | null;
}

export const tabsLayoutTabDisplayName = "TabsLayout.Tab";
export const tabsLayoutToolbarDisplayName = "TabsLayout.Toolbar";
export const tabsLayoutContentDisplayName = "TabsLayout.Content";
export const tabsLayoutFooterDisplayName = "TabsLayout.Footer";

/**
 * Возвращает стабильный displayName compound-элемента.
 * Это нужно для корректной работы HMR, где ссылочное сравнение `child.type` может ломаться.
 */
function getTabsLayoutElementDisplayName(child: ReactElement) {
	const { type } = child;

	if (typeof type === "function") {
		const componentType = type as JSXElementConstructor<unknown> & {
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

function isTabsLayoutElement<Props>(child: ReactNode, displayName: string): child is ReactElement<Props> {
	return isValidElement<Props>(child) && getTabsLayoutElementDisplayName(child) === displayName;
}

function parseTabsLayoutSections(children: ReactNode, tabId: string) {
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

export function parseTabsLayoutChildren(children: ReactNode): ParsedTabsLayoutTab[] {
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
