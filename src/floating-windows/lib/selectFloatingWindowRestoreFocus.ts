/** Закрытие неактивного modeless-окна не должно отнимать фокус у соседнего окна или страницы. */
export function selectFloatingWindowRestoreFocus(panel: HTMLElement | null): HTMLElement | undefined {
	const active = document.activeElement;
	// При StrictMode replay панель ещё подключена: её собственный фокус не заменяет opener.
	return active instanceof HTMLElement && active !== document.body && !panel?.contains(active) ? active : undefined;
}
