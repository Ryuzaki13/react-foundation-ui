import { useEffect, useEffectEvent } from "react";

import { readFloatingWindowsPositions, serializeFloatingWindowsPositions } from "../lib/floatingWindowsStorage";

import { type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Opt-in persistence после hydration; запрет/quota/corrupt cache не блокируют работу окна в памяти. */
export function useFloatingWindowsPersistence(
	store: FloatingWindowsStore,
	storageKey?: string,
	onStorageError?: (error: unknown) => void
): void {
	const reportError = useEffectEvent((error: unknown) => onStorageError?.(error));
	useEffect(() => {
		if (!storageKey) return;
		let storage: Storage;
		try {
			storage = window.localStorage;
			const saved = storage.getItem(storageKey);
			if (saved !== null) store.getState().restorePositions(readFloatingWindowsPositions(saved));
		} catch (error) {
			reportError(error);
			// Ошибка чтения оставляет рабочее состояние. Доступ к storage повторяется только при новом mount.
			return;
		}
		let writable = true;
		const write = () => {
			if (!writable) return;
			try {
				storage.setItem(storageKey, serializeFloatingWindowsPositions(store.getState().positions));
			} catch (error) {
				writable = false;
				reportError(error);
			}
		};
		// Подписка ставится после restore: регистрация children не может перезаписать ещё не прочитанные координаты.
		write();
		return store.subscribe((state, previous) => {
			if (state.positions !== previous.positions) write();
		});
	}, [store, storageKey]);
}
