import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Message } from "./Message";
import { NoData } from "./NoData";
import { Notice } from "./Notice";

describe("message components aria attributes", () => {
	it.each([
		[
			"Message",
			<Message role="status" aria-live="polite" aria-atomic aria-describedby="message-description">
				Сообщение
			</Message>
		],
		[
			"Notice",
			<Notice role="status" aria-live="polite" aria-atomic aria-describedby="message-description">
				Уведомление
			</Notice>
		],
		["NoData", <NoData role="status" aria-live="polite" aria-atomic aria-describedby="message-description" text="Пусто" />]
	])("%s передаёт aria-атрибуты на семантический узел", (_, component) => {
		render(
			<>
				<span id="message-description">Описание</span>
				{component}
			</>
		);

		const message = screen.getByRole("status");

		expect(message.getAttribute("aria-live")).toBe("polite");
		expect(message.getAttribute("aria-atomic")).toBe("true");
		expect(message.getAttribute("aria-describedby")).toBe("message-description");
	});
});
