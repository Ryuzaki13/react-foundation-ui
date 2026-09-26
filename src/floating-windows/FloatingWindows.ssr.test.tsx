// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FloatingWindow } from "./FloatingWindow";
import { FloatingWindows } from "./FloatingWindows";

describe("FloatingWindows SSR без DOM", () => {
	it("рендерит окно и команды без window, document, ResizeObserver и localStorage", () => {
		expect(typeof window).toBe("undefined");
		expect(typeof document).toBe("undefined");
		const html = renderToString(
			<FloatingWindows storageKey="ssr-window-layout">
				<FloatingWindow id="server-window" title="Окно SSR" defaultPosition={{ x: 40, y: 50 }} onClose={() => undefined}>
					<input defaultValue="SSR content" />
				</FloatingWindow>
			</FloatingWindows>
		);

		// Здесь markup является явным SSR/accessibility contract: содержимое
		// не исчезает до hydration, label связан с существующим заголовком.
		expect(html).toContain('data-floating-window-id="server-window"');
		expect(html).toContain('role="dialog"');
		expect(html).toContain('data-floating-window-action="move"');
		expect(html).toContain('data-floating-window-action="close"');
		expect(html).toContain('value="SSR content"');
		const labelId = /aria-labelledby="([^"]+)"/.exec(html)?.[1];
		expect(labelId).toBeTruthy();
		expect(html).toContain(`id="${labelId}"`);
	});
});
