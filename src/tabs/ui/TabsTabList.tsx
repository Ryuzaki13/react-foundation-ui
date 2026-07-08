import { ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { OneStepScroller } from "../../misc";

import styles from "./Tabs.module.scss";

import type { TabsDescriptor } from "../model/types";
import type { TabsStateModel } from "../model/useTabsState";

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
	const wrapItems = (children: ReactNode) => {
		if (state.orientation === "horizontal") {
			return <OneStepScroller>{children}</OneStepScroller>;
		}

		return <>{children}</>;
	};

	return (
		<div
			className={className}
			role="tablist"
			aria-orientation={state.orientation}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			onKeyDown={state.onTabListKeyDown}
			onBlur={state.onTabListBlur}>
			{wrapItems(
				items.map((item) => (
					<button
						key={item.id}
						{...state.getTabButtonProps(item)}
						data-ui="tabs-tab"
						data-action="select-tab"
						className={cn(styles.tab, "textWrap", item.id === state.selectedTabId && styles.selected)}>
						{item.title}
					</button>
				))
			)}
		</div>
	);
}
