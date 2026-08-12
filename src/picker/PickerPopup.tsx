import { type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { FloatingContext, FloatingFocusManager, FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "motion/react";

import styles from "./Picker.module.scss";
import { PickerOptions, type PickerSelectionActions } from "./PickerOptions";

interface PickerPopupProps {
	open: boolean;
	context: FloatingContext;
	floatingStyles: CSSProperties;
	listId: string;
	labelId?: string;
	popupAriaLabel?: string;
	descriptionId?: string;
	activeOptionId?: string;
	ariaMultiselectable?: boolean;
	popupRole?: "listbox" | "dialog";
	setFloating: (node: HTMLElement | null) => void;
	getFloatingProps: (userProps?: Record<string, unknown>) => Record<string, unknown>;
	onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
	initialFocus?: number;
	returnFocus?: boolean;
	tabIndex?: number;
	className?: string;
	maxWidth?: CSSProperties["maxWidth"];
	layoutClassName?: string;
	bodyClassName?: string;
	toolbar?: ReactNode | false;
	selectionActions?: PickerSelectionActions;
	children: ReactNode;
}

function stopNestedFloatingMouseDown(event: MouseEvent<HTMLElement>): void {
	event.stopPropagation();
}

export function PickerPopup({
	open,
	context,
	floatingStyles,
	listId,
	labelId,
	popupAriaLabel,
	descriptionId,
	activeOptionId,
	ariaMultiselectable,
	popupRole = "listbox",
	setFloating,
	getFloatingProps,
	onKeyDown,
	initialFocus = -1,
	returnFocus = false,
	tabIndex = 0,
	className,
	maxWidth,
	layoutClassName,
	bodyClassName,
	toolbar,
	selectionActions,
	children
}: PickerPopupProps) {
	return (
		<AnimatePresence>
			{open && (
				<FloatingPortal>
					<FloatingFocusManager context={context} modal={false} initialFocus={initialFocus} returnFocus={returnFocus}>
						<motion.div
							ref={setFloating}
							style={{ ...floatingStyles, maxWidth }}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							{...getFloatingProps({
								id: listId,
								role: popupRole,
								tabIndex,
								"aria-labelledby": labelId,
								"aria-label": labelId ? undefined : popupAriaLabel,
								"aria-describedby": descriptionId,
								"aria-activedescendant": activeOptionId,
								"aria-multiselectable": ariaMultiselectable || undefined,
								onMouseDown: stopNestedFloatingMouseDown,
								onKeyDown,
								className: styles.popupPositioner
							})}>
							<PickerOptions
								className={className}
								layoutClassName={layoutClassName}
								bodyClassName={bodyClassName}
								toolbar={toolbar}
								selectionActions={selectionActions}
								scrollable={false}>
								{children}
							</PickerOptions>
						</motion.div>
					</FloatingFocusManager>
				</FloatingPortal>
			)}
		</AnimatePresence>
	);
}
