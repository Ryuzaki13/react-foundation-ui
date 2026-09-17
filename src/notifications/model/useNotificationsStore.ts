import { useContext } from "react";

import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";

import { NotificationsContext } from "./notificationsContext";

/** Возвращает store ближайшего NotificationsProvider для внутренних notification-хуков. */
export function useNotificationsStore() {
	const store = useContext(NotificationsContext);

	if (!store) {
		throw createMissingContextError({
			hookName: "useNotificationsStore",
			providerName: "NotificationsProvider"
		});
	}

	return store;
}
