import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { shouldMountTabPanel } from "../lib/tabs";
import { TabsBoxProps } from "../model/types";
import { useTabsState } from "../model/useTabsState";

import styles from "./Tabs.module.scss";
import { TabsLoadingState } from "./TabsLoadingState";
import { TabsNoDataState } from "./TabsNoDataState";
import { TabsPanel } from "./TabsPanel";
import { TabsTabList } from "./TabsTabList";

/**
 * Простой items-based tabs-компонент.
 * Сам управляет областью панели и её прокруткой.
 */
export function TabsBox({
	items,
	value,
	defaultValue,
	onValueChange,
	className,
	isLoading,
	loadingText,
	cleanPanel,
	bordered = false,
	orientation = "horizontal",
	activationMode = "automatic",
	mountStrategy = "unmount",
	loop = true,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy
}: TabsBoxProps) {
	const state = useTabsState({
		items,
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
	const tabListClassName = styles.tabs;
	const panelsClassName = cn(styles.panels, styles.panelScrollable, "scrollable overscroll");
	const panelClassName = styles.panel;
	const panelBodyClassName = styles.panelBody;

	if (isLoading) {
		return (
			<TabsLoadingState
				containerClassName={rootClassName}
				tabListClassName={tabListClassName}
				panelsClassName={panelsClassName}
				panelClassName={panelClassName}
				panelBodyClassName={panelBodyClassName}
				loadingText={loadingText}
			/>
		);
	}

	if (!items.length) {
		return (
			<TabsNoDataState
				containerClassName={rootClassName}
				panelsClassName={panelsClassName}
				panelClassName={panelClassName}
				panelBodyClassName={panelBodyClassName}
			/>
		);
	}

	return (
		<div className={rootClassName}>
			<TabsTabList items={items} state={state} className={tabListClassName} ariaLabel={ariaLabel} ariaLabelledBy={ariaLabelledBy} />

			<div className={panelsClassName}>
				{items.map((item) => {
					const isSelected = item.id === state.selectedTabId;
					const isMounted = shouldMountTabPanel({
						mountStrategy,
						isSelected,
						isVisited: state.isVisited(item.id)
					});

					if (!isMounted) {
						return null;
					}

					return (
						<TabsPanel
							key={item.id}
							tabId={item.id}
							isSelected={isSelected}
							className={panelClassName}
							getTabElementId={state.getTabElementId}
							getPanelElementId={state.getPanelElementId}>
							<div className={panelBodyClassName}>{item.content}</div>
						</TabsPanel>
					);
				})}
			</div>
		</div>
	);
}
