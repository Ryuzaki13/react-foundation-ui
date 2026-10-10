import { vi } from "vitest";

/** jsdom не имеет layout: задаём реальные размеры и события, не подменяя Virtualizer. */
export function installAnalyticalGeometry() {
	const getHeight = (element: HTMLElement) =>
		element.tagName === "TR" || element.tagName === "TFOOT" ? 36 : element.tagName === "THEAD" ? element.children.length * 36 : 216;
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
		return {
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			right: 1024,
			bottom: getHeight(this),
			width: 1024,
			height: getHeight(this),
			toJSON: () => ({})
		};
	});
	vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
		return getHeight(this);
	});
	vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(1024);
	vi.stubGlobal(
		"ResizeObserver",
		class {
			private active = true;
			constructor(private callback: ResizeObserverCallback) {}
			observe(target: HTMLElement) {
				queueMicrotask(() => {
					if (this.active)
						this.callback(
							[
								{
									target,
									contentRect: target.getBoundingClientRect(),
									borderBoxSize: [{ blockSize: getHeight(target), inlineSize: 1024 }]
								} as unknown as ResizeObserverEntry
							],
							this as unknown as ResizeObserver
						);
				});
			}
			unobserve() {}
			disconnect() {
				this.active = false;
			}
		}
	);
	vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(1000000);
	vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(50000);
	vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
		return getHeight(this);
	});
	Object.defineProperty(HTMLElement.prototype, "scrollTo", {
		configurable: true,
		value: vi.fn(function (this: HTMLElement, options?: ScrollToOptions | number) {
			if (typeof options === "object") {
				const previousTop = this.scrollTop;
				const previousLeft = this.scrollLeft;
				this.scrollTop = Math.max(0, options.top ?? this.scrollTop);
				this.scrollLeft = Math.max(0, options.left ?? this.scrollLeft);
				if (previousTop !== this.scrollTop || previousLeft !== this.scrollLeft)
					queueMicrotask(() => this.dispatchEvent(new Event("scroll")));
			}
		})
	});
}
