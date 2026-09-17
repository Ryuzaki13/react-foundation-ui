import { useStore } from "zustand";

import { useNotificationsStore } from "./useNotificationsStore";

/** Возвращает активные уведомления, которые отображает краткоживущий toast-host. */
export function useNotifications() {
	const store = useNotificationsStore();
	return useStore(store, (state) => state.items);
}
