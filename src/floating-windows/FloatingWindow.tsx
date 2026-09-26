import { type CSSProperties, type ReactNode, useId, useRef } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexContainer } from "../flex";

import { FloatingWindowHeader } from "./FloatingWindowHeader";
import styles from "./FloatingWindows.module.scss";
import { getFloatingWindowStyle } from "./lib/getFloatingWindowStyle";
import { type FloatingWindowPosition } from "./model/floatingWindowsTypes";
import { useFloatingWindowFocus } from "./model/useFloatingWindowFocus";
import { useFloatingWindowMeasurements } from "./model/useFloatingWindowMeasurements";
import { useFloatingWindowMove } from "./model/useFloatingWindowMove";
import { useFloatingWindowSnapshot } from "./model/useFloatingWindowSnapshot";
import { useFloatingWindowsStore } from "./model/useFloatingWindowsStore";

export type FloatingWindowProps = Readonly<{
	/** Стабильный уникальный ID внутри одного FloatingWindows; не содержит пользовательских сообщений. */
	id: string;
	title: string;
	children: ReactNode;
	defaultPosition?: FloatingWindowPosition;
	width?: CSSProperties["width"];
	height?: CSSProperties["height"];
	actions?: ReactNode;
	onClose?: () => void;
	/** Только завершённый пользователем move; resize-коррекция и восстановление cache не являются командами пользователя. */
	onPositionChange?: (position: FloatingWindowPosition) => void;
	className?: string;
}>;

/** Немодальное окно: host управляет его существованием, primitive — геометрией, движением и локальным порядком. */
export function FloatingWindow({
	id,
	title,
	children,
	defaultPosition,
	width = 360,
	height = 300,
	actions,
	onClose,
	onPositionChange,
	className
}: FloatingWindowProps) {
	const store = useFloatingWindowsStore();
	const snapshot = useFloatingWindowSnapshot(store, id, defaultPosition);
	const panelRef = useRef<HTMLElement | null>(null);
	const titleId = useId();
	const instructionId = useId();
	useFloatingWindowMeasurements(store, id, panelRef);
	useFloatingWindowFocus(panelRef);
	const move = useFloatingWindowMove({ id, store, panelRef, onPositionChange });
	return (
		<FlexContainer
			column
			ref={panelRef}
			role="dialog"
			aria-labelledby={titleId}
			tabIndex={-1}
			data-floating-window-id={id}
			className={cn("surface0 radiusMd shadowLg", styles.window, className)}
			style={getFloatingWindowStyle(snapshot, width, height)}
			onPointerDownCapture={() => store.getState().bringToFront(id)}
			onFocusCapture={() => store.getState().bringToFront(id)}
			onKeyDown={(event) => {
				if (event.key !== "Escape" || event.defaultPrevented || store.getState().order.at(-1) !== id || !onClose) return;
				event.preventDefault();
				event.stopPropagation();
				onClose();
			}}>
			<FloatingWindowHeader
				title={title}
				titleId={titleId}
				instructionId={instructionId}
				actions={actions}
				onClose={onClose}
				move={move}
			/>
			<span id={instructionId} className="visuallyHidden">
				Для перемещения нажмите Enter или пробел, затем используйте стрелки. Shift — шаг 1 пиксель. Enter или пробел — сохранить,
				Escape — отменить.
			</span>
			<div className={styles.content}>{children}</div>
		</FlexContainer>
	);
}
