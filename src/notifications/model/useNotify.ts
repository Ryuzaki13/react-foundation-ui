import { type NotificationPushInput, type NotificationType } from "@ryuzaki13/react-foundation-lib/notifications";
import { useStore } from "zustand";

import { useNotificationsStore } from "./useNotificationsStore";

/** Возвращает действия notification-store и сокращённые методы для каждого типа уведомления. */
export function useNotify() {
	const store = useNotificationsStore();
	const actions = useStore(store, (state) => state.actions);

	const createShortcut = (type: NotificationType) => (message: string, options?: Omit<NotificationPushInput, "type" | "message">) =>
		actions.push({ type, message, ...options });

	return {
		...actions,
		success: createShortcut("success"),
		info: createShortcut("info"),
		warning: createShortcut("warning"),
		error: createShortcut("error")
	};
}
