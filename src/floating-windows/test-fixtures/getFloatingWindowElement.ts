/** Находит окно по публичной identity, независимо от его заголовка и DOM-обёрток. */
export function getFloatingWindowElement(id: string, scope: ParentNode = document): HTMLElement {
	const element = Array.from(scope.querySelectorAll<HTMLElement>("[data-floating-window-id]")).find(
		(candidate) => candidate.dataset.floatingWindowId === id
	);
	if (!element) throw new Error(`Не найдено окно ${id}`);
	return element;
}
