import { useContext } from "react";

import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";

import { AnalyticalTableCellOverflowPopoverContext } from "./AnalyticalTableCellOverflowPopoverContext";

/**
 * Возвращает стабильную команду открытия общего overflow-popover таблицы.
 */
export function useAnalyticalTableCellOverflowPopover() {
	const context = useContext(AnalyticalTableCellOverflowPopoverContext);

	if (context === null) {
		throw createMissingContextError({
			hookName: "useAnalyticalTableCellOverflowPopover",
			providerName: "AnalyticalTableCellOverflowPopoverProvider"
		});
	}

	return context;
}
