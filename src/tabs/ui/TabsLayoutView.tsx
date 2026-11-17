import { type ReactNode, useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Scrollable } from "../../misc";
import uiStyles from "../../ui.module.scss";
import { getUiPanelToneClassName } from "../../uiClasses";
import { UI_PANEL_TONE_SURFACE } from "../../uiSchemeConstants";
import { parseTabsLayoutChildren } from "../lib/parseTabsLayoutChildren";
import { shouldMountTabPanel } from "../lib/tabs";
import { TABS_ACTIVATION_MANUAL, TABS_MOUNT_LAZY, TABS_ORIENTATION_HORIZONTAL } from "../model/tabsConstants";
import { type TabsLayoutProps } from "../model/types";
import { useTabsState } from "../model/useTabsState";

import styles from "./Tabs.module.scss";
import { TabsPanel } from "./TabsPanel";
import { TabsTabList } from "./TabsTabList";

type TabsLayoutViewProps = TabsLayoutProps & {
	framed?: boolean;
	tabBarAction?: ReactNode;
};

/**
 * Compound-оболочка tabs для составных panel-layout сценариев.
 * Сам компонент управляет только переключением и каркасом панели.
 */
export function TabsLayoutView({
	children,
	tabBarAction,
	value,
	defaultValue,
	onValueChange,
	className,
	orientation = TABS_ORIENTATION_HORIZONTAL,
	activationMode = TABS_ACTIVATION_MANUAL,
	mountStrategy = TABS_MOUNT_LAZY,
	loop = true,
	tone = UI_PANEL_TONE_SURFACE,
	clean = false,
	framed = true,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy
}: TabsLayoutViewProps) {
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
		clean ? styles.clean : uiStyles.uiFilledPanel,
		framed ? styles.framed : undefined,
		styles[orientation],
		getUiPanelToneClassName(tone),
		className
	);
	const panelsClassName = cn(styles.panels, styles.layoutPanels);

	return (
		<div className={rootClassName}>
			<div className={cn(styles.tabsWrapper, Boolean(tabBarAction) && styles.tabsWrapperWithAction)}>
				{tabBarAction}
				<TabsTabList items={tabs} state={state} className={styles.tabs} ariaLabel={ariaLabel} ariaLabelledBy={ariaLabelledBy} />
			</div>

			<div className={panelsClassName}>
				{tabs.map((tab) => {
					const isSelected = tab.id === state.selectedTabId;
					const isMounted = shouldMountTabPanel({
						mountStrategy,
						isSelected,
						isVisited: state.isVisited(tab.id)
					});

					const templateRows = `${tab.toolbar ? "auto " : ""}minmax(0, 1fr)${tab.footer ? " auto" : ""}`;

					// Tab ведёт к самой области прокрутки. Оболочка связывает все секции с вкладкой.
					return (
						<TabsPanel
							key={tab.id}
							tabId={tab.id}
							isSelected={isSelected}
							className={styles.panel}
							tabIndex={-1}
							getTabElementId={state.getTabElementId}
							getPanelElementId={state.getPanelElementId}>
							{isMounted ? (
								<div className={styles.layoutPanel} style={{ gridTemplateRows: templateRows }}>
									{tab.toolbar ? (
										<div className={cn(styles.layoutSection, tab.toolbar.className)}>{tab.toolbar.children}</div>
									) : null}
									<Scrollable
										className={cn(styles.layoutSection, styles.layoutContent, tab.content.className)}
										tabIndex={isSelected ? 0 : -1}>
										{tab.content.children}
									</Scrollable>
									{tab.footer ? (
										<div className={cn(styles.layoutSection, tab.footer.className)}>{tab.footer.children}</div>
									) : null}
								</div>
							) : null}
						</TabsPanel>
					);
				})}
			</div>
		</div>
	);
}
