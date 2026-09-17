import { useStore } from "zustand";

import { useNotificationsStore } from "./useNotificationsStore";

/**
 * Возвращает полную историю уведомлений за время жизни NotificationsProvider.
 * Hook не задаёт контейнер или разметку: host-проект сам отображает историю на странице, в модалке или диалоге.
 */
export function useNotificationHistory() {
	const store = useNotificationsStore();
	return useStore(store, (state) => state.history);
}
