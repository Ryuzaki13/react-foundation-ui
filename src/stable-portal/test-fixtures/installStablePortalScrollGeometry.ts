/**
 * JSDOM не вычисляет layout и не ограничивает offsets. Fixture воспроизводит
 * browser clamp при hidden/disconnect и временном исчезновении scroll range.
 */
export function installStablePortalScrollGeometry(element: HTMLElement) {
	let top = 0;
	let left = 0;
	const visible = () => element.isConnected && element.closest("[hidden], [inert], [data-test-clipped]") === null;
	const availableHeight = () => (visible() ? 40 : 0);
	const availableWidth = () => (visible() ? 80 : 0);
	const contentHeight = () => (element.closest("[data-test-no-scroll-range]") === null ? 400 : availableHeight());
	const contentWidth = () => (element.closest("[data-test-no-scroll-range]") === null ? 300 : availableWidth());
	Object.defineProperties(element, {
		clientHeight: { configurable: true, get: availableHeight },
		clientWidth: { configurable: true, get: availableWidth },
		scrollHeight: { configurable: true, get: contentHeight },
		scrollWidth: { configurable: true, get: contentWidth },
		scrollTop: {
			configurable: true,
			get: () => (visible() ? top : 0),
			set: (value: number) => {
				top = visible() ? Math.max(0, Math.min(value, contentHeight() - availableHeight())) : 0;
			}
		},
		scrollLeft: {
			configurable: true,
			get: () => (visible() ? left : 0),
			set: (value: number) => {
				left = visible() ? Math.max(0, Math.min(value, contentWidth() - availableWidth())) : 0;
			}
		}
	});
	return {
		resetNativeOffsets: () => {
			// Browser может обнулить offsets до layout-effect владельца portal.
			top = 0;
			left = 0;
		}
	};
}
