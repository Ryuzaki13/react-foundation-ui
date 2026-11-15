import { type ReactNode } from "react";

/**
 * Унифицированная ARIA-обёртка для содержимого активной панели tabs.
 */
interface TabsPanelProps {
	tabId: string;
	isSelected: boolean;
	className?: string;
	tabIndex?: number;
	getTabElementId: (tabId: string) => string;
	getPanelElementId: (tabId: string) => string;
	children?: ReactNode;
}

export function TabsPanel({
	tabId,
	isSelected,
	className,
	tabIndex = isSelected ? 0 : -1,
	getTabElementId,
	getPanelElementId,
	children
}: TabsPanelProps) {
	return (
		<div
			role="tabpanel"
			id={getPanelElementId(tabId)}
			aria-labelledby={getTabElementId(tabId)}
			hidden={!isSelected}
			tabIndex={tabIndex}
			className={className}>
			{children}
		</div>
	);
}
