import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Popover } from "../../popover";
import {
	AnalyticalTableCellOverflowPopoverContext,
	type ShowAnalyticalTableCellOverflowPopover
} from "../model/AnalyticalTableCellOverflowPopoverContext";

import styles from "./AnalyticalTable.module.scss";
import { AnalyticalTableCellOverflowPopoverAnchor } from "./AnalyticalTableCellOverflowPopoverAnchor";

/**
 * Состояние единственного открытого overflow-popover внутри таблицы.
 */
type ActiveAnalyticalTableCellOverflowPopover = Readonly<{
	anchor: HTMLElement;
	content: string;
	sourceVersion: unknown;
}>;

/**
 * Пропсы владельца общего overflow-popover аналитической таблицы.
 */
type AnalyticalTableCellOverflowPopoverProviderProps = Readonly<{
	children: ReactNode;
	scrollElement: HTMLElement | null;
	sourceVersion: unknown;
}>;

/**
 * Владеет единственным лениво создаваемым popover для всех data-ячеек таблицы.
 *
 * До первого подходящего клика компонент не монтирует ни `Popover`, ни portal,
 * ни floating-наблюдатели. Ячейки получают только стабильную функцию открытия,
 * поэтому смена активного anchor не перерисовывает остальные значения.
 */
export function AnalyticalTableCellOverflowPopoverProvider({
	children,
	scrollElement,
	sourceVersion
}: AnalyticalTableCellOverflowPopoverProviderProps) {
	const [activePopover, setActivePopover] = useState<ActiveAnalyticalTableCellOverflowPopover | null>(null);
	const visiblePopover = activePopover !== null && activePopover.sourceVersion === sourceVersion ? activePopover : null;

	const showPopover = useCallback<ShowAnalyticalTableCellOverflowPopover>(
		(anchor, content) => {
			setActivePopover({ anchor, content, sourceVersion });
		},
		[sourceVersion]
	);

	const handleOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setActivePopover(null);
		}
	}, []);

	useEffect(() => {
		if (visiblePopover === null || scrollElement === null) {
			return;
		}

		const handleScroll = () => {
			setActivePopover(null);
		};

		scrollElement.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			scrollElement.removeEventListener("scroll", handleScroll);
		};
	}, [scrollElement, visiblePopover]);

	return (
		<AnalyticalTableCellOverflowPopoverContext value={showPopover}>
			{children}

			{visiblePopover !== null ? (
				<Popover placement="bottom-start" open onOpenChange={handleOpenChange}>
					<AnalyticalTableCellOverflowPopoverAnchor anchor={visiblePopover.anchor} />
					<Popover.Content>
						<div className={styles.cellOverflowPopover} data-ui="analytical-table-cell-overflow-popover">
							{visiblePopover.content}
						</div>
					</Popover.Content>
				</Popover>
			) : null}
		</AnalyticalTableCellOverflowPopoverContext>
	);
}
