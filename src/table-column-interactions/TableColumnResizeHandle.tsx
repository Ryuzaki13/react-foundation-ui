import { useRef, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { normalizeTableColumnWidth, type TableColumnSizingUnit } from "@ryuzaki13/react-foundation-lib/table";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./TableColumnInteractions.module.scss";

const DEFAULT_KEYBOARD_RESIZE_STEP = 8;

export type TableColumnResizeHandleProps = {
	columnId: string;
	className?: string;
	minWidth?: number;
	/** Единица minimum и callback-значений; экранные координаты и keyboardStep остаются в px. */
	unit?: TableColumnSizingUnit;
	keyboardStep?: number;
	ariaLabel?: string;
	/** Необязательный источник измеренной экранной ширины в px. */
	getStartWidth?: (columnId: string, element: HTMLElement) => number;
	onResize: (columnId: string, width: number) => void;
	onResizeEnd?: (columnId: string, width: number) => void;
	onReset?: (columnId: string) => void;
};

export function TableColumnResizeHandle({
	columnId,
	className,
	minWidth,
	unit = "px",
	keyboardStep = DEFAULT_KEYBOARD_RESIZE_STEP,
	ariaLabel = "Изменить ширину колонки",
	getStartWidth,
	onResize,
	onResizeEnd,
	onReset
}: TableColumnResizeHandleProps) {
	const resolvedMinWidth = normalizeTableColumnWidth(0, minWidth, unit);
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);
	const lastWidthRef = useRef(0);
	const pixelsPerUnitRef = useRef(1);
	const activeRef = useRef(false);
	const movedRef = useRef(false);

	const resolveStartWidth = (element: HTMLElement) => {
		const headerCell = element.closest("th");
		const tableElement = element.closest("table") ?? element;
		const pixelsPerUnit =
			unit === "em" ? Number.parseFloat(element.ownerDocument.defaultView?.getComputedStyle(tableElement).fontSize ?? "") : 1;

		if (!Number.isFinite(pixelsPerUnit) || pixelsPerUnit <= 0) {
			throw new Error("Для относительного resize нужен вычисленный размер шрифта таблицы.");
		}

		const widthPx = getStartWidth?.(columnId, element) ?? headerCell?.getBoundingClientRect().width;

		return {
			width: normalizeTableColumnWidth((widthPx ?? resolvedMinWidth * pixelsPerUnit) / pixelsPerUnit, resolvedMinWidth, unit),
			pixelsPerUnit
		};
	};

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0 && event.pointerType === "mouse") return;

		const start = resolveStartWidth(event.currentTarget);

		activeRef.current = true;
		movedRef.current = false;
		startXRef.current = event.clientX;
		startWidthRef.current = start.width;
		// Масштаб измеряется один раз на жест, а не на каждом pointermove.
		pixelsPerUnitRef.current = start.pixelsPerUnit;
		lastWidthRef.current = startWidthRef.current;
		event.currentTarget.setPointerCapture(event.pointerId);

		event.preventDefault();
		event.stopPropagation();
	};

	const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!activeRef.current) return;

		const nextWidth = normalizeTableColumnWidth(
			startWidthRef.current + (event.clientX - startXRef.current) / pixelsPerUnitRef.current,
			resolvedMinWidth,
			unit
		);
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
		const current = resolveStartWidth(event.currentTarget);
		const nextWidth = normalizeTableColumnWidth(
			current.width + (direction * keyboardStep) / current.pixelsPerUnit,
			resolvedMinWidth,
			unit
		);
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
