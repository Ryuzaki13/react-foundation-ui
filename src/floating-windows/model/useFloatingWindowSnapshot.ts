import { useEffect, useEffectEvent, useMemo } from "react";

import { useStore } from "zustand";

import { type FloatingWindowPosition, type FloatingWindowSnapshot, type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Подписка ограничена одной записью: перемещение соседа не перерисовывает содержимое этого окна. */
export function useFloatingWindowSnapshot(
	store: FloatingWindowsStore,
	id: string,
	defaultPosition?: FloatingWindowPosition
): FloatingWindowSnapshot {
	const x = defaultPosition?.x ?? 24;
	const y = defaultPosition?.y ?? 24;
	const fallback = useMemo<FloatingWindowSnapshot>(() => ({ position: { x, y }, size: null, layer: 0 }), [x, y]);
	const snapshot = useStore(store, (state) => state.windows.get(id) ?? fallback);
	const register = useEffectEvent(() => store.getState().register(id, { x, y }));
	// defaultPosition читается при регистрации identity, но не переоткрывает уже размещённое окно.
	useEffect(() => register(), [store, id]);
	return snapshot;
}
