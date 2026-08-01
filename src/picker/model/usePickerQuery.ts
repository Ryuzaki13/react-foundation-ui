import { useState } from "react";

import { PickerTriggerMode, createPickerTriggerPolicy } from "./createPickerTriggerPolicy";

interface UsePickerQueryOptions {
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	resetOnClose?: boolean;
	triggerMode?: PickerTriggerMode;
}

/**
 * Управляет controlled/uncontrolled query и возвращает policy закрытия владельцу open-state.
 * Сброс выполняется самим владельцем в событии close, поэтому hook не зеркалит lifecycle через effect.
 */
export function usePickerQuery({ query, defaultQuery, onQuery, resetOnClose, triggerMode }: UsePickerQueryOptions) {
	const isControlled = query !== undefined;
	const [internalQuery, setInternalQuery] = useState(defaultQuery ?? "");
	const currentQuery = isControlled ? (query ?? "") : internalQuery;
	const resolvedResetOnClose = resetOnClose ?? (triggerMode ? createPickerTriggerPolicy(triggerMode).resetQueryOnClose : true);

	const setQuery = (nextValue: string) => {
		if (!isControlled) {
			setInternalQuery(nextValue);
		}

		onQuery?.(nextValue);
	};

	return {
		query: currentQuery,
		setQuery,
		clearQuery: () => setQuery(""),
		resetQueryOnClose: resolvedResetOnClose
	};
}
