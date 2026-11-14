import { type NotificationPushInput, type NotificationType } from "@ryuzaki13/react-foundation-lib/notifications";
import { useStore } from "zustand";

import {
	NOTIFICATION_TYPE_SUCCESS,
	NOTIFICATION_TYPE_INFO,
	NOTIFICATION_TYPE_WARNING,
	NOTIFICATION_TYPE_ERROR
} from "./notificationTypeConstants";
import { useNotificationsStore } from "./useNotificationsStore";

/** Возвращает действия notification-store и сокращённые методы для каждого типа уведомления. */
export function useNotify() {
	const store = useNotificationsStore();
	const actions = useStore(store, (state) => state.actions);

	const createShortcut = (type: NotificationType) => (message: string, options?: Omit<NotificationPushInput, "type" | "message">) =>
		actions.push({ type, message, ...options });

	return {
		...actions,
		success: createShortcut(NOTIFICATION_TYPE_SUCCESS),
		info: createShortcut(NOTIFICATION_TYPE_INFO),
		warning: createShortcut(NOTIFICATION_TYPE_WARNING),
		error: createShortcut(NOTIFICATION_TYPE_ERROR)
	};
}
