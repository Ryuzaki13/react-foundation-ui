/* eslint-disable react-refresh/only-export-components */
import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from "react";

import { useStore } from "zustand";

import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";
import {
	bindNotifications,
	createNotificationsStore,
	NotificationId,
	NotificationPushInput,
	NotificationsStoreApi,
	NotificationType
} from "@ryuzaki13/react-foundation-lib/notifications";

const NotificationsContext = createContext<NotificationsStoreApi | null>(null);

/**
 * Провайдер уведомлений приложения. Хранит состояние списка уведомлений и предоставляет хуки доступа к нему.
 */
export function NotificationsProvider({ children }: PropsWithChildren) {
	const store = useMemo(() => createNotificationsStore(), []);

	useEffect(() => {
		return bindNotifications(store);
	}, [store]);

	return <NotificationsContext.Provider value={store}>{children}</NotificationsContext.Provider>;
}

function useNotificationApi() {
	const ctx = useContext(NotificationsContext);
	if (!ctx) {
		throw createMissingContextError({
			hookName: "useNotificationApi",
			providerName: "NotificationsProvider"
		});
	}
	return ctx;
}

export function useNotifications() {
	const api = useNotificationApi();
	return useStore(api, (s) => s.items);
}

export function useNotify() {
	const api = useNotificationApi();
	const actions = useStore(api, (s) => s.actions);

	const mk = (type: NotificationType) => (message: string, opts?: Omit<NotificationPushInput, "type" | "message">) =>
		actions.push({ type, message, ...opts });

	return {
		...actions,
		success: mk("success"),
		info: mk("info"),
		warning: mk("warning"),
		error: mk("error")
	};
}

export function useNotificationById(id: NotificationId) {
	const api = useNotificationApi();
	return useStore(api, (s) => s.items.find((n) => n.id === id));
}
