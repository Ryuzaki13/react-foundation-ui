/** URL не зависит от browser origin: сервер и клиент принимают одну абсолютную безопасную форму. */
export function resolveTextEditorViewerLink(input: unknown): string | null {
	if (typeof input !== "string" || input.length === 0 || /[\s\u0000-\u001f\u007f]/u.test(input)) return null;
	if (!URL.canParse(input)) return null;
	const url = new URL(input);
	if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname || url.username || url.password) return null;
	return url.href;
}
