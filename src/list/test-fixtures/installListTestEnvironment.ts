import { vi } from "vitest";

/**
 * jsdom не рассчитывает геометрию. Этот browser adapter задаёт viewport и реальные
 * измерения строк по их ключам, не заменяя Virtualizer, события или React lifecycle.
 */
export function installListTestEnvironment() {
	const rowHeights = new Map<string, number>();
	const observers = new Map<ResizeObserver, Readonly<{ callback: ResizeObserverCallback; targets: Set<Element> }>>();
	const originalRect = HTMLElement.prototype.getBoundingClientRect;
	const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");

	class ListResizeObserver implements ResizeObserver {
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

	vi.stubGlobal("ResizeObserver", ListResizeObserver);
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
		if (this.getAttribute("role") === "region") return new DOMRect(0, 0, 400, 240);
		const item = this.querySelector<HTMLElement>("[data-list-test-item]");
		const key = item?.dataset.listTestItem;
		if (this.tagName === "LI" && key !== undefined) {
			return new DOMRect(0, 0, 400, rowHeights.get(key) ?? 120);
		}
		return originalRect.call(this);
	});
	vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
		return this.getBoundingClientRect().height;
	});
	vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
		return this.getBoundingClientRect().width;
	});
	vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
		return this.getAttribute("role") === "region" ? 240 : 0;
	});
	vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(function (this: HTMLElement) {
		return this.getAttribute("role") === "region" ? 400 : 0;
	});
	Object.defineProperty(HTMLElement.prototype, "scrollTo", {
		configurable: true,
		value(this: HTMLElement, optionsOrX: ScrollToOptions | number, y?: number) {
			this.scrollTop = typeof optionsOrX === "number" ? (y ?? 0) : (optionsOrX.top ?? this.scrollTop);
			this.dispatchEvent(new Event("scroll"));
		}
	});

	return {
		setRowHeight(key: string, height: number) {
			rowHeights.set(key, height);
		},
		activeObservedTargets() {
			return [...observers.values()].reduce((count, observer) => count + observer.targets.size, 0);
		},
		flushResizeObservers() {
			for (const [observer, { callback, targets }] of observers) {
				const entries = [...targets].map((target): ResizeObserverEntry => {
					const contentRect = target.getBoundingClientRect();
					const size = { inlineSize: contentRect.width, blockSize: contentRect.height };
					return { target, contentRect, borderBoxSize: [size], contentBoxSize: [size], devicePixelContentBoxSize: [size] };
				});
				if (entries.length > 0) callback(entries, observer);
			}
		},
		restore() {
			if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, "scrollTo", originalScrollTo);
			else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
			vi.restoreAllMocks();
			vi.unstubAllGlobals();
		}
	};
}
