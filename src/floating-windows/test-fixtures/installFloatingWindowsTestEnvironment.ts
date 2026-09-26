import { vi } from "vitest";

type FloatingWindowsTestArea = Readonly<{ width: number; height: number }>;

/**
 * jsdom не вычисляет layout и не реализует pointer capture. Здесь задаётся
 * только измеряемая область: реальные события и React lifecycle остаются у UI.
 */
export function installFloatingWindowsTestEnvironment() {
	let area: FloatingWindowsTestArea = { width: 800, height: 600 };
	let areaBorder = 0;
	let windowSize: FloatingWindowsTestArea | undefined;
	const observers = new Map<ResizeObserver, Readonly<{ callback: ResizeObserverCallback; targets: Set<Element> }>>();
	const captures = new WeakMap<HTMLElement, Set<number>>();
	const originalRect = HTMLElement.prototype.getBoundingClientRect;

	class FloatingWindowsResizeObserver implements ResizeObserver {
		constructor(callback: ResizeObserverCallback) {
			observers.set(this, { callback, targets: new Set() });
		}

		observe(target: Element) {
			observers.get(this)?.targets.add(target);
		}

		unobserve(target: Element) {
			observers.get(this)?.targets.delete(target);
		}

		disconnect() {
			observers.get(this)?.targets.clear();
		}
	}

	vi.stubGlobal("ResizeObserver", FloatingWindowsResizeObserver);
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
		if (this.hasAttribute("data-floating-windows")) return new DOMRect(0, 0, area.width + areaBorder * 2, area.height + areaBorder * 2);
		if (this.hasAttribute("data-floating-window-id")) {
			if (windowSize) return new DOMRect(0, 0, windowSize.width, windowSize.height);
			const width = this.style.width.endsWith("px") ? Number.parseFloat(this.style.width) : 300;
			const height = this.style.height.endsWith("px") ? Number.parseFloat(this.style.height) : 200;
			return new DOMRect(0, 0, Math.min(width, area.width), Math.min(height, area.height));
		}
		return originalRect.call(this);
	});
	vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
		return this.hasAttribute("data-floating-windows") ? area.width : this.getBoundingClientRect().width;
	});
	vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
		return this.hasAttribute("data-floating-windows") ? area.height : this.getBoundingClientRect().height;
	});
	vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
		return this.getBoundingClientRect().width;
	});
	vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
		return this.getBoundingClientRect().height;
	});

	// Свойства prototype восстанавливаются явно: соседние тесты могут иметь
	// собственную модель pointer capture.
	const originalCapture = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "setPointerCapture");
	const originalRelease = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "releasePointerCapture");
	const originalHasCapture = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "hasPointerCapture");
	Object.defineProperties(HTMLElement.prototype, {
		setPointerCapture: {
			configurable: true,
			value(this: HTMLElement, pointerId: number) {
				const active = captures.get(this) ?? new Set<number>();
				active.add(pointerId);
				captures.set(this, active);
			}
		},
		releasePointerCapture: {
			configurable: true,
			value(this: HTMLElement, pointerId: number) {
				captures.get(this)?.delete(pointerId);
			}
		},
		hasPointerCapture: {
			configurable: true,
			value(this: HTMLElement, pointerId: number) {
				return captures.get(this)?.has(pointerId) ?? false;
			}
		}
	});

	return {
		resizeArea(next: FloatingWindowsTestArea) {
			area = next;
		},
		setAreaBorder(width: number) {
			areaBorder = width;
		},
		setWindowSize(size: FloatingWindowsTestArea) {
			windowSize = size;
		},
		flushResizeObservers() {
			for (const [observer, { callback, targets }] of observers) {
				const entries = Array.from(targets, (target): ResizeObserverEntry => {
					const contentRect = target.getBoundingClientRect();
					const size = { inlineSize: contentRect.width, blockSize: contentRect.height };
					return { target, contentRect, borderBoxSize: [size], contentBoxSize: [size], devicePixelContentBoxSize: [size] };
				});
				if (entries.length > 0) callback(entries, observer);
			}
		},
		restore() {
			for (const [key, descriptor] of [
				["setPointerCapture", originalCapture],
				["releasePointerCapture", originalRelease],
				["hasPointerCapture", originalHasCapture]
			] as const) {
				if (descriptor) Object.defineProperty(HTMLElement.prototype, key, descriptor);
				else Reflect.deleteProperty(HTMLElement.prototype, key);
			}
			vi.restoreAllMocks();
			vi.unstubAllGlobals();
		}
	};
}
