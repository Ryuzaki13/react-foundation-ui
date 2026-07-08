import { useRef, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { DEFAULT_TABLE_COLUMN_MIN_WIDTH, normalizeTableColumnWidth } from "@ryuzaki13/react-foundation-lib/table";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./TableColumnInteractions.module.scss";

const DEFAULT_KEYBOARD_RESIZE_STEP = 8;

export type TableColumnResizeHandleProps = {
	columnId: string;
	className?: string;
	minWidth?: number;
	keyboardStep?: number;
	ariaLabel?: string;
	getStartWidth?: (columnId: string, element: HTMLElement) => number;
	onResize: (columnId: string, width: number) => void;
	onResizeEnd?: (columnId: string, width: number) => void;
	onReset?: (columnId: string) => void;
};

function resolveHeaderCellWidth(element: HTMLElement, minWidth: number): number {
	const headerCell = element.closest("th");
	const width = headerCell?.getBoundingClientRect().width;

	return normalizeTableColumnWidth(typeof width === "number" && Number.isFinite(width) ? width : minWidth, minWidth);
}

export function TableColumnResizeHandle({
	columnId,
	className,
	minWidth,
	keyboardStep = DEFAULT_KEYBOARD_RESIZE_STEP,
	ariaLabel = "Изменить ширину колонки",
	getStartWidth,
	onResize,
	onResizeEnd,
	onReset
}: TableColumnResizeHandleProps) {
	const resolvedMinWidth = minWidth ?? DEFAULT_TABLE_COLUMN_MIN_WIDTH;
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);
	const lastWidthRef = useRef(0);
	const activeRef = useRef(false);
	const movedRef = useRef(false);

	const resolveStartWidth = (element: HTMLElement) => {
		const width = getStartWidth?.(columnId, element) ?? resolveHeaderCellWidth(element, resolvedMinWidth);

		return normalizeTableColumnWidth(width, resolvedMinWidth);
	};

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0 && event.pointerType === "mouse") return;

		activeRef.current = true;
		movedRef.current = false;
		startXRef.current = event.clientX;
		startWidthRef.current = resolveStartWidth(event.currentTarget);
		lastWidthRef.current = startWidthRef.current;
		event.currentTarget.setPointerCapture(event.pointerId);

		event.preventDefault();
		event.stopPropagation();
	};

	const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!activeRef.current) return;

		const nextWidth = normalizeTableColumnWidth(startWidthRef.current + event.clientX - startXRef.current, resolvedMinWidth);
		lastWidthRef.current = nextWidth;
		movedRef.current = true;
		onResize(columnId, nextWidth);

		event.preventDefault();
		event.stopPropagation();
	};

	const finishPointerResize = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!activeRef.current) return;

		activeRef.current = false;

		if (movedRef.current) {
			onResizeEnd?.(columnId, lastWidthRef.current);
		}

		try {
			event.currentTarget.releasePointerCapture(event.pointerId);
		} catch {
			// Pointer capture мог быть сброшен браузером при отмене жеста.
		}

		event.preventDefault();
		event.stopPropagation();
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home") {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (event.key === "Home") {
			onReset?.(columnId);
			return;
		}

		const direction = event.key === "ArrowRight" ? 1 : -1;
		const currentWidth = resolveStartWidth(event.currentTarget);
		const nextWidth = normalizeTableColumnWidth(currentWidth + direction * keyboardStep, resolvedMinWidth);
		onResize(columnId, nextWidth);
		onResizeEnd?.(columnId, nextWidth);
	};

	return (
		<div
			role="separator"
			aria-label={ariaLabel}
			aria-orientation="vertical"
			tabIndex={0}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={finishPointerResize}
			onPointerCancel={finishPointerResize}
			onKeyDown={handleKeyDown}
			onDoubleClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				onReset?.(columnId);
			}}
			className={cn(styles.resizeHandle, className)}
		/>
	);
}
