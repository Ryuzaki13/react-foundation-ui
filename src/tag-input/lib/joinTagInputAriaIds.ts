/** Объединяет сгенерированные и пользовательские ARIA ID, исключая пустые части. */
export function joinTagInputAriaIds(...ids: Array<string | undefined>) {
	return ids.filter(Boolean).join(" ") || undefined;
}
