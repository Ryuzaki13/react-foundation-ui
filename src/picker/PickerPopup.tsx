import { type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode, useRef } from "react";

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
	popupRole?: "listbox" | "tree" | "treegrid" | "grid" | "dialog";
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
	const compositeRef = useRef<HTMLDivElement | null>(null);
	const isDialog = popupRole === "dialog";
	const compositeProps = isDialog
		? undefined
		: getFloatingProps({
				id: listId,
				role: popupRole,
				tabIndex,
				"aria-labelledby": labelId,
				"aria-label": labelId ? undefined : popupAriaLabel,
				"aria-describedby": descriptionId,
				"aria-activedescendant": activeOptionId,
				"aria-multiselectable": ariaMultiselectable || undefined,
				onKeyDown
			});
	const handlePositionerFocus = (event: FocusEvent<HTMLDivElement>) => {
		if (!isDialog && event.target === event.currentTarget) {
			compositeRef.current?.focus();
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<FloatingPortal preserveTabOrder={false}>
					<FloatingFocusManager
						context={context}
						modal={false}
						guards={false}
						initialFocus={initialFocus}
						returnFocus={returnFocus}>
						<motion.div
							ref={setFloating}
							style={{ ...floatingStyles, maxWidth }}
							className={styles.popupPositioner}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							tabIndex={isDialog ? undefined : -1}
							onMouseDown={stopNestedFloatingMouseDown}
							onFocus={isDialog ? undefined : handlePositionerFocus}
							{...(isDialog
								? getFloatingProps({
										id: listId,
										role: "dialog",
										tabIndex,
										"aria-labelledby": labelId,
										"aria-label": labelId ? undefined : popupAriaLabel,
										"aria-describedby": descriptionId,
										onMouseDown: stopNestedFloatingMouseDown,
										onKeyDown
									})
								: {})}>
							<PickerOptions
								className={className}
								layoutClassName={layoutClassName}
								bodyClassName={bodyClassName}
								toolbar={toolbar}
								selectionActions={selectionActions}
								bodyRef={isDialog ? undefined : compositeRef}
								bodyProps={isDialog ? undefined : compositeProps}
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
