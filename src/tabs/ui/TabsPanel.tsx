import { type ReactNode } from "react";

/**
 * Унифицированная ARIA-обёртка для содержимого активной панели tabs.
 */
interface TabsPanelProps {
	tabId: string;
	isSelected: boolean;
	className?: string;
	getTabElementId: (tabId: string) => string;
	getPanelElementId: (tabId: string) => string;
	children?: ReactNode;
}

export function TabsPanel({ tabId, isSelected, className, getTabElementId, getPanelElementId, children }: TabsPanelProps) {
	return (
		<div
			role="tabpanel"
			id={getPanelElementId(tabId)}
			aria-labelledby={getTabElementId(tabId)}
			hidden={!isSelected}
			tabIndex={isSelected ? 0 : -1}
			className={className}>
			{children}
		</div>
	);
}
