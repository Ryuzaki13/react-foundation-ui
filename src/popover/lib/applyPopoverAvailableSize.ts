type ApplyPopoverAvailableSizeOptions = {
	readonly availableWidth: number;
	readonly availableHeight: number;
	readonly floating: HTMLElement;
};

/**
 * Передаёт вычисленную Floating UI доступную область самому popover через CSS-переменные.
 * Потребитель может совместить эти границы со своим размером и режимом прокрутки,
 * не дублируя `size()` middleware и правила clipping context.
 */
export function applyPopoverAvailableSize({ availableWidth, availableHeight, floating }: ApplyPopoverAvailableSizeOptions) {
	floating.style.setProperty("--popover-available-width", `${Math.max(0, availableWidth)}px`);
	floating.style.setProperty("--popover-available-height", `${Math.max(0, availableHeight)}px`);
}
