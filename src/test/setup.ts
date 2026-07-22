import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Создаёт статический результат media query для jsdom, где browser API `matchMedia` отсутствует.
 * По умолчанию запросы не совпадают, а отдельные тесты могут переопределить `window.matchMedia`,
 * когда им требуется проверить конкретный responsive-сценарий.
 */
function createStaticMediaQueryList(query: string): MediaQueryList {
	return {
		matches: false,
		media: query,
		onchange: null,
		addListener: () => undefined,
		removeListener: () => undefined,
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
		dispatchEvent: () => false
	};
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		writable: true,
		value: createStaticMediaQueryList
	});
}

afterEach(() => {
	cleanup();
});
