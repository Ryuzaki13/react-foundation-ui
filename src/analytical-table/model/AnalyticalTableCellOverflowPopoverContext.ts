import { createContext } from "react";

/**
 * Команда показа полного значения относительно нажатого текстового элемента.
 */
export type ShowAnalyticalTableCellOverflowPopover = (anchor: HTMLElement, content: string) => void;

/**
 * Приватный канал между value-ячейками и единственным владельцем popover.
 */
export const AnalyticalTableCellOverflowPopoverContext = createContext<ShowAnalyticalTableCellOverflowPopover | null>(null);
