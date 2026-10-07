import { type StablePortalScrollTracking } from "./stablePortalScrollTrackingTypes";

type ScrollPosition = Readonly<{ top: number; left: number }>;

/**
 * Event snapshot предшествует удалению host: поздний transfer уже может видеть
 * нулевую геометрию и browser-clamped offsets. Factory не читает DOM до connect/capture.
 */
export function createStablePortalScrollTracking(container: HTMLElement): StablePortalScrollTracking {
	const positions = new Map<HTMLElement, ScrollPosition>();
	const captureElement = (element: HTMLElement) => {
		if (!element.isConnected || !container.contains(element) || element.closest("[hidden], [inert]")) return;
		const width = element.clientWidth;
		const height = element.clientHeight;
		if (width <= 0 || height <= 0) return;
		const style = element.ownerDocument.defaultView?.getComputedStyle(element);
		if (!style || style.display === "none" || style.visibility !== "visible" || style.contentVisibility === "hidden") return;
		const previous = positions.get(element);
		// При временно недоступном диапазоне browser zero не отменяет прежнее
		// положение. Настоящий scroll к нулю в измеримой области принимается явно.
		positions.set(element, {
			top: element.scrollHeight > height ? element.scrollTop : (previous?.top ?? element.scrollTop),
			left: element.scrollWidth > width ? element.scrollLeft : (previous?.left ?? element.scrollLeft)
		});
	};
	const prune = () => {
		for (const element of positions.keys()) {
			if (!container.contains(element)) positions.delete(element);
		}
	};
	return {
		connect: () => {
			const captureScroll = (event: Event) => {
				const element = event.target;
				// Native scroll не всплывает: capture наблюдает все собственные области,
				// но за событие читает ровно один узел, не обходя subtree.
				if (element instanceof HTMLElement) captureElement(element);
			};
			container.addEventListener("scroll", captureScroll, { capture: true, passive: true });
			const observer = new MutationObserver((records) => {
				if (positions.size === 0 || !records.some((record) => Array.from(record.removedNodes).some((node) => node.nodeType === 1)))
					return;
				// Только removal элементов: изменение текста/selection/ввод не сканирует
				// дерево. Стоимость pruning ограничена числом реально scrolled nodes.
				prune();
			});
			observer.observe(container, { childList: true, subtree: true });
			return () => {
				container.removeEventListener("scroll", captureScroll, true);
				observer.disconnect();
				positions.clear();
			};
		},
		capture: () => {
			prune();
			// Единственный scan — на transfer, для programmatic initial offsets
			// без scroll event. Hidden/detached source не затирает event snapshot.
			for (const element of container.querySelectorAll<HTMLElement>("*")) {
				if (positions.has(element) || element.scrollTop !== 0 || element.scrollLeft !== 0) captureElement(element);
			}
		},
		restore: () => {
			prune();
			for (const [element, position] of positions) {
				element.scrollTop = position.top;
				element.scrollLeft = position.left;
			}
		}
	};
}
