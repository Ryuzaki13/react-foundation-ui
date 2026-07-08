import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { ExpandableActionPanel, ExpandableActionPanelProps } from "./ExpandableActionPanel";
import styles from "./ExpandableActionPanel.module.scss";

export interface LabeledExpandableActionPanelProps extends Omit<ExpandableActionPanelProps, "className"> {
	label: React.ReactNode;
	className?: string;
	labelClassName?: string;
	labelStyle?: React.CSSProperties;
	labelMinWidth?: React.CSSProperties["minWidth"];
	panelClassName?: string;
}

/**
 * Раскрывающаяся панель действий с левым текстом, который сжимается через `flexEllipsis`.
 */
export function LabeledExpandableActionPanel({
	label,
	className,
	labelClassName,
	labelStyle,
	labelMinWidth = "12em",
	panelClassName,
	open,
	defaultOpen,
	...panelProps
}: LabeledExpandableActionPanelProps) {
	const resolvedLabelStyle: React.CSSProperties = {
		...labelStyle,
		minWidth: labelMinWidth
	};
	const title = typeof label === "string" ? label : undefined;

	return (
		<div className={cn(styles.labeledPanel, className)} data-ui="labeled-expandable-action-panel">
			<div className={cn("flexEllipsis", styles.label, labelClassName)} style={resolvedLabelStyle} title={title}>
				{label}
			</div>
			<ExpandableActionPanel
				{...panelProps}
				open={open}
				defaultOpen={defaultOpen}
				className={cn(styles.labeledActionPanel, panelClassName)}
			/>
		</div>
	);
}
