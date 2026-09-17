import { type PropsWithChildren, useEffect, useMemo } from "react";

import { bindNotifications, createNotificationsStore } from "@ryuzaki13/react-foundation-lib/notifications";

import { NotificationsContext } from "./notificationsContext";

/**
 * Провайдер уведомлений приложения. Хранит активный toast-стек и полную историю уведомлений.
 */
export function NotificationsProvider({ children }: PropsWithChildren) {
	const store = useMemo(() => createNotificationsStore(), []);

	useEffect(() => bindNotifications(store), [store]);

	return <NotificationsContext.Provider value={store}>{children}</NotificationsContext.Provider>;
}
