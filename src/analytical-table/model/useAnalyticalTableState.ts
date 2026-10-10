import { useState } from "react";

import { type AnalyticalTableProps, type AnalyticalTableState } from "../types/analyticalTable";

/** Controlled-владелец получает команды; локальное состояние используется только без state. */
export function useAnalyticalTableState<T>(props: AnalyticalTableProps<T>) {
	const [localState, setLocalState] = useState<AnalyticalTableState>(() => props.defaultState ?? {});
	const state = props.state ?? localState;
	const patchState = (patch: Partial<AnalyticalTableState>) => {
		const next = { ...state, ...patch };
		if (props.state === undefined) setLocalState(next);
		props.onStateChange?.(next);
	};
	return { state, patchState };
}
