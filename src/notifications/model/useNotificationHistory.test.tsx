// @vitest-environment jsdom

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotificationsProvider } from "./NotificationsProvider";
import { useNotificationHistory } from "./useNotificationHistory";
import { useNotifications } from "./useNotifications";
import { useNotify } from "./useNotify";

function TestNotificationsProvider({ children }: PropsWithChildren) {
	return <NotificationsProvider>{children}</NotificationsProvider>;
}

describe("useNotificationHistory", () => {
	it("сохраняет все уведомления независимо от лимита, dismiss и очистки toast-стека", () => {
		const { result } = renderHook(
			() => ({
				active: useNotifications(),
				history: useNotificationHistory(),
				actions: useNotify()
			}),
			{ wrapper: TestNotificationsProvider }
		);

		act(() => {
			for (let index = 1; index <= 8; index += 1) {
				result.current.actions.info(`Уведомление ${index}`, {
					id: `notification-${index}`,
					ttlMs: 0
				});
			}
		});

		expect(result.current.active.map((notification) => notification.id)).toEqual([
			"notification-8",
			"notification-7",
			"notification-6",
			"notification-5",
			"notification-4",
			"notification-3"
		]);
		expect(result.current.history).toHaveLength(8);

		act(() => {
			result.current.actions.dismiss("notification-8");
			result.current.actions.clear();
		});

		expect(result.current.active).toEqual([]);
		expect(result.current.history).toHaveLength(8);
	});

	it("очищает историю отдельно от активного toast-стека", () => {
		const { result } = renderHook(
			() => ({
				active: useNotifications(),
				history: useNotificationHistory(),
				actions: useNotify()
			}),
			{ wrapper: TestNotificationsProvider }
		);

		act(() => {
			result.current.actions.warning("Нужно проверить данные", { id: "visible", ttlMs: 0 });
			result.current.actions.clearHistory();
		});

		expect(result.current.history).toEqual([]);
		expect(result.current.active.map((notification) => notification.id)).toEqual(["visible"]);
	});
});
