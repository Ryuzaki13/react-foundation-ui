import { describe, expect, it } from "vitest";

import { applyPopoverAvailableSize } from "./applyPopoverAvailableSize";

describe("applyPopoverAvailableSize", () => {
	it("передаёт доступные размеры clipping context через CSS-переменные", () => {
		const floating = document.createElement("div");

		applyPopoverAvailableSize({ availableWidth: 640, availableHeight: 480, floating });

		expect(floating.style.getPropertyValue("--popover-available-width")).toBe("640px");
		expect(floating.style.getPropertyValue("--popover-available-height")).toBe("480px");
	});

	it("не передаёт отрицательный доступный размер", () => {
		const floating = document.createElement("div");

		applyPopoverAvailableSize({ availableWidth: -20, availableHeight: -10, floating });

		expect(floating.style.getPropertyValue("--popover-available-width")).toBe("0px");
		expect(floating.style.getPropertyValue("--popover-available-height")).toBe("0px");
	});
});
