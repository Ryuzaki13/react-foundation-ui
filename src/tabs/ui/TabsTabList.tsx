import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { OneStepScroller } from "../../misc";
import { type TabsDescriptor } from "../model/types";
import { type TabsStateModel } from "../model/useTabsState";

import styles from "./Tabs.module.scss";

/**
 * Рендерит tablist и кнопки вкладок поверх общей модели tabs.
 */
interface TabsTabListProps {
	items: TabsDescriptor[];
	state: TabsStateModel;
	className?: string;
	ariaLabel?: string;
	ariaLabelledBy?: string;
}

export function TabsTabList({ items, state, className, ariaLabel, ariaLabelledBy }: TabsTabListProps) {
	const tabList = (
		<div
			data-ui="tabs-tablist"
			className={className}
			role="tablist"
			aria-orientation={state.orientation}
			aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? "Вкладки")}
			aria-labelledby={ariaLabelledBy}
			aria-live="off"
			onKeyDown={state.onTabListKeyDown}
			onBlur={state.onTabListBlur}>
			{items.map((item) => (
				<button
					key={item.id}
					{...state.getTabButtonProps(item)}
					data-ui="tabs-tab"
					data-action="select-tab"
					className={cn(styles.tab, "textWrap", item.id === state.selectedTabId && styles.selected)}>
					{item.title}
				</button>
			))}
		</div>
	);

	if (state.orientation === "horizontal") {
		return <OneStepScroller itemSelector="[role='tab']">{tabList}</OneStepScroller>;
	}

	return tabList;
}
