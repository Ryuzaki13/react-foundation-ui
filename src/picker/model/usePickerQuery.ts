import { useEffect, useEffectEvent, useRef, useState } from "react";

import { PickerTriggerMode, createPickerTriggerPolicy } from "./createPickerTriggerPolicy";

interface UsePickerQueryOptions {
	open: boolean;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	resetOnClose?: boolean;
	triggerMode?: PickerTriggerMode;
}

export function usePickerQuery({ open, query, defaultQuery, onQuery, resetOnClose, triggerMode }: UsePickerQueryOptions) {
	const previousOpenRef = useRef(false);
	const isControlled = query !== undefined;
	const [internalQuery, setInternalQuery] = useState(defaultQuery ?? "");
	const currentQuery = isControlled ? (query ?? "") : internalQuery;
	const syncResetInternalQuery = useEffectEvent(() => setInternalQuery(""));
	const resolvedResetOnClose = resetOnClose ?? (triggerMode ? createPickerTriggerPolicy(triggerMode).resetQueryOnClose : true);

	useEffect(() => {
		if (previousOpenRef.current && !open && resolvedResetOnClose) {
			if (!isControlled) {
				syncResetInternalQuery();
			}

			onQuery?.("");
		}

		previousOpenRef.current = open;
	}, [isControlled, onQuery, open, resolvedResetOnClose]);

	const setQuery = (nextValue: string) => {
		if (!isControlled) {
			setInternalQuery(nextValue);
		}

		onQuery?.(nextValue);
	};

	return {
		query: currentQuery,
		setQuery,
		clearQuery: () => setQuery("")
	};
}
