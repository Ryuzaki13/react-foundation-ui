import { type NotificationId } from "@ryuzaki13/react-foundation-lib/notifications";
import { useStore } from "zustand";

import { useNotificationsStore } from "./useNotificationsStore";

/** Возвращает активное toast-уведомление по идентификатору. */
export function useNotificationById(id: NotificationId) {
	const store = useNotificationsStore();
	return useStore(store, (state) => state.items.find((notification) => notification.id === id));
}
