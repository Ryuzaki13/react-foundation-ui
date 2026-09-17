// @vitest-environment jsdom

import { act } from "react";

import { notify } from "@ryuzaki13/react-foundation-lib/notifications";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NotificationsProvider } from "../model";

import { NotificationsHost } from "./NotificationsHost";

describe("NotificationsHost", () => {
	it("разделяет обычные и срочные live-region без вложенного повторного объявления", () => {
		render(
			<NotificationsProvider>
				<NotificationsHost />
			</NotificationsProvider>
		);

		act(() => {
			notify.info("Данные синхронизированы", { title: "Синхронизация", ttlMs: 0 });
			notify.error("Не удалось сохранить запись", { title: "Сохранение", ttlMs: 0 });
		});

		const region = screen.getByRole("region", { name: "Область уведомлений" });
		const status = within(region).getByRole("status");
		const alert = within(region).getByRole("alert");

		expect(region.hasAttribute("aria-live")).toBe(false);
		expect(status.tagName).toBe("DIV");
		expect(status.getAttribute("aria-atomic")).toBe("true");
		expect(alert.tagName).toBe("DIV");
		expect(alert.getAttribute("aria-atomic")).toBe("true");
	});

	it("даёт кнопке закрытия контекст и сохраняет управление с клавиатуры", async () => {
		const user = userEvent.setup();
		const onAction = vi.fn();
		render(
			<NotificationsProvider>
				<NotificationsHost />
			</NotificationsProvider>
		);

		act(() => {
			notify.warning("Проверьте параметры", {
				title: "Импорт",
				ttlMs: 0,
				actions: [{ label: "Повторить", onClick: onAction }]
			});
		});

		const status = screen.getByRole("status");
		const action = within(status).getByRole("button", { name: "Повторить" });
		const dismiss = within(status).getByRole("button", { name: "Закрыть уведомление «Импорт»" });

		action.focus();
		await user.keyboard("{Enter}");
		expect(onAction).toHaveBeenCalledOnce();

		await user.click(dismiss);
		expect(screen.queryByRole("status")).toBeNull();
	});
});
