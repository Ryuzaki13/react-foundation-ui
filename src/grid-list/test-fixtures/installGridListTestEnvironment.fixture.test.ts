import { vi } from "vitest";

import { installCollectionTestEnvironment } from "../../virtualized-collection/test-fixtures/installCollectionTestEnvironment.fixture.test";

/**
 * Дополняет общий browser adapter результатами CSS Grid, которых нет в jsdom.
 * Число tracks задаёт тест как внешний результат браузерной раскладки; сам
 * virtualizer, React identity, подписки и события остаются настоящими.
 */
export function installGridListTestEnvironment() {
	const collection = installCollectionTestEnvironment();
	const collectionRect = vi.mocked(HTMLElement.prototype.getBoundingClientRect).getMockImplementation();
	const computedStyle = window.getComputedStyle.bind(window);
	const itemHeights = new Map<string, number>();
	const animationFrames = new Map<number, FrameRequestCallback>();
	let nextFrameId = 0;
	let columnCount = 3;
	let width = 960;
	let rowGap = 0;

	// Управляем только browser scheduler: resize delivery и следующий кадр
	// остаются разными фазами, чтобы cleanup проверял отмену уже поставленной работы.
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		const id = ++nextFrameId;
		animationFrames.set(id, callback);
		return id;
	});
	vi.stubGlobal("cancelAnimationFrame", (id: number) => {
		animationFrames.delete(id);
	});

	function flushAnimationFrames(): void {
		const callbacks = [...animationFrames.values()];
		animationFrames.clear();
		for (const callback of callbacks) callback(0);
	}

	vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(function (this: HTMLElement) {
		if (this.hasAttribute("data-grid-list-layout")) return new DOMRect(0, 0, width, 0);
		if (this.hasAttribute("data-grid-list-measure")) {
			const cells = Array.from(this.parentElement?.children ?? []).filter(
				(cell): cell is HTMLElement => cell instanceof HTMLElement && cell.style.gridRow === this.style.gridRow
			);
			const heights = cells.flatMap((cell) => {
				const item = cell.querySelector<HTMLElement>("[data-grid-test-item]");
				const key = item?.dataset.gridTestItem;
				return key === undefined ? [] : [itemHeights.get(key) ?? 120];
			});
			return new DOMRect(0, 0, width, heights.length === 0 ? 120 : Math.max(...heights));
		}
		if (this.tagName === "LI" && this.hasAttribute("data-index")) return new DOMRect(0, 0, width, 120);
		return collectionRect?.call(this) ?? new DOMRect();
	});
	vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudoElement) => {
		const style = computedStyle(element, pseudoElement);
		if (element.hasAttribute("data-grid-list-layout")) {
			Object.defineProperties(style, {
				gridTemplateColumns: { configurable: true, value: Array.from({ length: columnCount }, () => "300px").join(" ") },
				rowGap: { configurable: true, value: rowGap === 0 ? "normal" : `${rowGap}px` }
			});
		}
		return style;
	});

	return {
		...collection,
		flushResizeObservers() {
			collection.flushResizeObservers();
			flushAnimationFrames();
		},
		deliverResizeObservers: collection.flushResizeObservers,
		flushAnimationFrames,
		pendingAnimationFrames() {
			return animationFrames.size;
		},
		setLayout(columns: number, nextWidth = columns * 320, gap = 0) {
			columnCount = columns;
			width = nextWidth;
			rowGap = gap;
		},
		setItemHeight(key: string, height: number) {
			itemHeights.set(key, height);
		}
	};
}
