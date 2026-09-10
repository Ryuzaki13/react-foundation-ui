import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusIndicator } from "./StatusIndicator";
import styles from "./StatusIndicator.module.scss";

describe("StatusIndicator", () => {
	it("по умолчанию рендерит декоративный neutral-индикатор среднего размера", () => {
		render(<StatusIndicator data-testid="indicator" title="Состояние" className="custom-class" />);

		const indicator = screen.getByTestId("indicator");

		expect(indicator.tagName).toBe("SPAN");
		expect(indicator.getAttribute("aria-hidden")).toBe("true");
		expect(indicator.getAttribute("data-ui")).toBe("status-indicator");
		expect(indicator.getAttribute("title")).toBe("Состояние");
		expect(indicator.classList).toContain(styles.statusIndicator, styles.neutral, styles.sizeMd, "custom-class");
		expect(indicator.classList).not.toContain(styles.animated);
	});

	it("применяет выбранные tone, size и анимацию, сохраняя явную доступную семантику", () => {
		render(<StatusIndicator data-testid="indicator" tone="success" size="lg" animated role="img" aria-label="Синхронизировано" />);

		const indicator = screen.getByTestId("indicator");

		expect(indicator.classList).toContain(styles.success, styles.sizeLg, styles.animated);
		expect(indicator.getAttribute("role")).toBe("img");
		expect(indicator.getAttribute("aria-label")).toBe("Синхронизировано");
		expect(indicator.hasAttribute("aria-hidden")).toBe(false);
	});
});
