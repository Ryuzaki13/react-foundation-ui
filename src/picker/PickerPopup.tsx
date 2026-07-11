import { type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { FloatingContext, FloatingFocusManager, FloatingPortal } from "@floating-ui/react";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AnimatePresence, motion } from "motion/react";

import { Separator } from "../separator";

import styles from "./Picker.module.scss";

interface PickerPopupProps {
	open: boolean;
	context: FloatingContext;
	floatingStyles: CSSProperties;
	listId: string;
	labelId?: string;
	descriptionId?: string;
	activeOptionId?: string;
	setFloating: (node: HTMLElement | null) => void;
	getFloatingProps: (userProps?: Record<string, unknown>) => Record<string, unknown>;
	onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
	initialFocus?: number;
	returnFocus?: boolean;
	tabIndex?: number;
	className?: string;
	maxWidth?: CSSProperties["maxWidth"];
	layoutClassName?: string;
	headerClassName?: string;
	bodyClassName?: string;
	header?: ReactNode;
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
	descriptionId,
	activeOptionId,
	setFloating,
	getFloatingProps,
	onKeyDown,
	initialFocus = -1,
	returnFocus = false,
	tabIndex = 0,
	className,
	maxWidth,
	layoutClassName,
	headerClassName,
	bodyClassName,
	header,
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
								tabIndex,
								"aria-labelledby": labelId,
								"aria-describedby": descriptionId,
								"aria-activedescendant": activeOptionId,
								onMouseDown: stopNestedFloatingMouseDown,
								onKeyDown,
								className
							})}>
							<div className={cn(styles.popupLayout, layoutClassName)}>
								{header ? (
									<div className={headerClassName}>
										{header}
										<Separator className="marginBlockSm" />
									</div>
								) : (
									<div />
								)}
								<div className={cn(styles.popupBody, bodyClassName)}>{children}</div>
							</div>
						</motion.div>
					</FloatingFocusManager>
				</FloatingPortal>
			)}
		</AnimatePresence>
	);
}
