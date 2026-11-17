import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../../ui.module.scss";
import { getUiPanelToneClassName } from "../../uiClasses";
import { UI_PANEL_TONE_SURFACE } from "../../uiSchemeConstants";
import { shouldMountTabPanel } from "../lib/tabs";
import { TABS_ACTIVATION_AUTOMATIC, TABS_MOUNT_UNMOUNT, TABS_ORIENTATION_HORIZONTAL } from "../model/tabsConstants";
import { type TabsBoxProps } from "../model/types";
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
	orientation = TABS_ORIENTATION_HORIZONTAL,
	activationMode = TABS_ACTIVATION_AUTOMATIC,
	mountStrategy = TABS_MOUNT_UNMOUNT,
	loop = true,
	tone = UI_PANEL_TONE_SURFACE,
	clean = false,
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
		styles.framed,
		clean ? styles.clean : uiStyles.uiFilledPanel,
		styles[orientation],
		getUiPanelToneClassName(tone),
		className
	);
	const tabListClassName = styles.tabs;
	const panelsClassName = cn(styles.panels, "scrollable overscroll");
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
			<div className={styles.tabsWrapper}>
				<TabsTabList
					items={items}
					state={state}
					className={tabListClassName}
					ariaLabel={ariaLabel}
					ariaLabelledBy={ariaLabelledBy}
				/>
			</div>

			<div className={panelsClassName}>
				{items.map((item) => {
					const isSelected = item.id === state.selectedTabId;
					const isMounted = shouldMountTabPanel({
						mountStrategy,
						isSelected,
						isVisited: state.isVisited(item.id)
					});

					return (
						<TabsPanel
							key={item.id}
							tabId={item.id}
							isSelected={isSelected}
							className={panelClassName}
							getTabElementId={state.getTabElementId}
							getPanelElementId={state.getPanelElementId}>
							{isMounted ? <div className={panelBodyClassName}>{item.content}</div> : null}
						</TabsPanel>
					);
				})}
			</div>
		</div>
	);
}
