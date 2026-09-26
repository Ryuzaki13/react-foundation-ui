/** Идентификатор команды является контрактом; доступное имя проверяется отдельно. */
export function getFloatingWindowAction(window: HTMLElement, action: "move" | "close"): HTMLButtonElement {
	const element = window.querySelector<HTMLButtonElement>(`[data-floating-window-action="${action}"]`);
	if (!element) throw new Error(`Не найдена команда окна ${action}`);
	return element;
}
