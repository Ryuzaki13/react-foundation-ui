import { createContext } from "react";

import { type NotificationsStoreApi } from "@ryuzaki13/react-foundation-lib/notifications";

/** Внутренний канал store: публичный доступ host-проект получает через notification-хуки. */
export const NotificationsContext = createContext<NotificationsStoreApi | null>(null);
