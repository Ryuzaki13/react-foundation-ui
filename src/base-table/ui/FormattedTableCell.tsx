import { useEffect, useRef } from "react";

import { type FormattersPipelineDisplayValue, resolveValueStateClassName } from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { RenderStateIcon } from "../../misc";

import styles from "./FormattedTableCell.module.scss";

import type { TableColumnAlign } from "@ryuzaki13/react-foundation-lib/table";

/**
 * Пропсы общего renderer форматированной ячейки.
 */
export interface FormattedTableCellProps {
	/**
	 * Нормализованный display-result из formatting-runtime.
	 */
	displayValue: FormattersPipelineDisplayValue;
	/**
	 * Табличное выравнивание содержимого.
	 */
	align?: TableColumnAlign;
}

/**
 * Общий renderer форматированной ячейки для `Table` и будущего `TreeTable`.
 *
 * Компонент отвечает только за UI-отрисовку уже вычисленного display-result:
 * runtime и бизнес-логика вычисления значения в него не входят.
 */
export function FormattedTableCell({ displayValue, align = "left" }: FormattedTableCellProps) {
	const textRef = useRef<HTMLSpanElement | null>(null);
	const showValue = displayValue.showValue;
	const showIcon = displayValue.showIcon;
	const icon = showIcon ? displayValue.icon : undefined;
	const textValue = showValue && displayValue.value != null ? String(displayValue.value) : "";
	const stateClassName = resolveValueStateClassName(displayValue.state);
	const justifyContent = align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";
	const textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";

	useEffect(() => {
		const element = textRef.current;
		if (!element) {
			return;
		}

		const updateTitle = () => {
			if (!displayValue.overflowTooltip || !textValue) {
				element.removeAttribute("title");
				return;
			}

			const isOverflowing = element.scrollWidth > element.clientWidth + 1;
			if (isOverflowing) {
				element.setAttribute("title", textValue);
				return;
			}

			element.removeAttribute("title");
		};

		updateTitle();

		if (typeof ResizeObserver === "undefined") {
			return;
		}

		const observer = new ResizeObserver(updateTitle);
		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [displayValue.overflowTooltip, textValue]);

	return (
		<div className={cn(styles.formattedCell, stateClassName)}>
			<div className={styles.formattedCellInner} style={{ justifyContent }}>
				{displayValue.iconPosition === "left" ? <RenderStateIcon state={icon} /> : null}

				{showValue ? (
					<span ref={textRef} className={cn("textOverflow", styles.formattedCellValue)} style={{ textAlign }}>
						{textValue}
					</span>
				) : null}

				{displayValue.iconPosition === "right" ? <RenderStateIcon state={icon} /> : null}
			</div>
		</div>
	);
}
