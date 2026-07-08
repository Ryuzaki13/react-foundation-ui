import React, { PropsWithChildren, useCallback, useId, useState } from "react";

import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Button } from "../button";
import { OneStepScroller } from "../misc";

import styles from "./ExpandableActionPanel.module.scss";

export interface ExpandableActionPanelProps extends PropsWithChildren {
	className?: string;
	contentClassName?: string;
	toggleClassName?: string;
	open?: boolean;
	defaultOpen?: boolean;
	disabled?: boolean;
	onOpenChange?: (open: boolean) => void;
	expandLabel?: string;
	collapseLabel?: string;
	panelLabel?: string;
	itemSelector?: string;
	scrollPadding?: number;
	smoothScroll?: boolean;
}

/**
 * Горизонтальная раскрывающаяся панель действий.
 * Не знает о внешнем layout и может использоваться рядом с любым содержимым.
 */
export function ExpandableActionPanel({
	children,
	className,
	contentClassName,
	toggleClassName,
	open: controlledOpen,
	defaultOpen = false,
	disabled,
	onOpenChange,
	expandLabel = "Раскрыть панель действий влево",
	collapseLabel = "Свернуть панель действий",
	panelLabel = "Действия панели",
	itemSelector,
	scrollPadding,
	smoothScroll
}: ExpandableActionPanelProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const panelId = useId();
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const setOpen = useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
		(value) => {
			const nextOpen = typeof value === "function" ? value(open) : value;

			if (!isControlled) {
				setUncontrolledOpen(nextOpen);
			}

			onOpenChange?.(nextOpen);
		},
		[isControlled, onOpenChange, open]
	);

	const handleToggle = () => setOpen((prevOpen) => !prevOpen);
	const ToggleIcon = open ? ChevronsRightIcon : ChevronsLeftIcon;

	return (
		<div className={cn(styles.expandableActionPanel, className)} data-ui="expandable-action-panel" data-open={open ? "" : undefined}>
			<Button
				className={toggleClassName}
				icon={<ToggleIcon />}
				title={open ? collapseLabel : expandLabel}
				disabled={disabled}
				variant="neutralOutline"
				aria-expanded={open}
				aria-controls={panelId}
				data-ui="expandable-action-panel-toggle"
				data-action={open ? "collapse-action-panel" : "expand-action-panel"}
				onClick={handleToggle}
			/>

			{open && (
				<div id={panelId} role="group" aria-label={panelLabel} className={cn(styles.content, contentClassName)}>
					<OneStepScroller
						className={styles.contentScroller}
						itemSelector={itemSelector}
						scrollPadding={scrollPadding}
						smooth={smoothScroll}>
						{children}
					</OneStepScroller>
				</div>
			)}
		</div>
	);
}
