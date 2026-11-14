/** Находит корень Lexical, у которого без доступного имени в readOnly нет роли textbox. */
export function getLexicalEditorRoot(container: HTMLElement): HTMLElement {
	const root = container.querySelector('[data-lexical-editor="true"]');
	if (!(root instanceof HTMLElement)) throw new Error("Не найден корень редактора Lexical.");

	return root;
}
