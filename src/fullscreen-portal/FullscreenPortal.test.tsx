import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FullscreenPortal } from "./FullscreenPortal";

beforeEach(() => {
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("FullscreenPortal viewport", () => {
	it("учитывает поздний FloatingPortal mount без второго scroll-lock owner", async () => {
		vi.stubGlobal("visualViewport", Object.assign(new EventTarget(), { width: 390, height: 320, offsetTop: 100, offsetLeft: 0 }));
		const view = render(
			<FullscreenPortal open title="Поверхность" description="Описание" onOpenChange={() => undefined}>
				Содержимое
			</FullscreenPortal>
		);
		const panel = await screen.findByRole("dialog");
		await waitFor(() => expect(panel.parentElement?.style.getPropertyValue("--visual-viewport-height")).toBe("320px"));
		expect(panel.parentElement?.style.getPropertyValue("--visual-viewport-top")).toBe("100px");
		expect(document.body.style.position).toBe("fixed");
		expect(document.body.style.getPropertyValue("--floating-ui-scrollbar-width")).toBe("");
		view.unmount();
		expect(document.body.style.position).toBe("");
		expect(window.scrollTo).toHaveBeenCalledOnce();
	});
});
