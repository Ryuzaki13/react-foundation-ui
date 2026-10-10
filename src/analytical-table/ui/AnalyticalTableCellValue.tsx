import { useState, type MouseEvent as ReactMouseEvent } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { isAnalyticalCellOverflowing } from "../lib/isAnalyticalCellOverflowing";
import { useAnalyticalTableCellOverflowPopover } from "../model/useAnalyticalTableCellOverflowPopover";

import styles from "./AnalyticalTable.module.scss";

/**
 * Пропсы текстового значения стандартной data-ячейки.
 */
type AnalyticalTableCellValueProps = Readonly<{
	display: string;
	isMeasure: boolean;
	overflowTooltip: boolean;
}>;

/**
 * Текст ячейки с ленивым определением фактического overflow.
 *
 * Измерение выполняется только перед показом native tooltip. Локальное состояние
 * принадлежит самому `span`, поэтому при скрытии значения или переходе на custom
 * renderer старый результат измерения уничтожается вместе с DOM-элементом.
 */
export function AnalyticalTableCellValue({ display, isMeasure, overflowTooltip }: AnalyticalTableCellValueProps) {
	const [measuredOverflowValue, setMeasuredOverflowValue] = useState<string | null>(null);
	const showOverflowPopover = useAnalyticalTableCellOverflowPopover();
	const isOverflowing = measuredOverflowValue === display;
	const title = isOverflowing ? display : undefined;

	const handleMouseEnter = (event: ReactMouseEvent<HTMLSpanElement>) => {
		if (!display) {
			setMeasuredOverflowValue(null);
			return;
		}

		setMeasuredOverflowValue(isAnalyticalCellOverflowing(event.currentTarget) ? display : null);
	};

	const handleClick = (event: ReactMouseEvent<HTMLSpanElement>) => {
		if (event.button !== 0 || !display) {
			return;
		}

		const hasOverflow = isAnalyticalCellOverflowing(event.currentTarget);
		setMeasuredOverflowValue(hasOverflow ? display : null);

		if (!overflowTooltip || !hasOverflow) {
			return;
		}

		// Открытие полного текста не должно одновременно активировать selection ячейки или строки.
		event.stopPropagation();
		showOverflowPopover(event.currentTarget, display);
	};

	return (
		<span
			className={cn("textOverflow", styles.cellValue)}
			data-measure={isMeasure || undefined}
			data-overflow-popover={overflowTooltip && isOverflowing ? true : undefined}
			aria-haspopup={overflowTooltip && isOverflowing ? "dialog" : undefined}
			title={title}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}>
			{display}
		</span>
	);
}
