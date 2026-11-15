import { parseTextEditorExternalLink } from "../parseTextEditorExternalLink";

/** Сохранённые адреса проходят общую проверку в канонической форме без привязки к browser origin. */
export function resolveTextEditorViewerLink(input: unknown): string | null {
	if (typeof input !== "string" || /[\s\u0000-\u001f\u007f]/u.test(input)) return null;

	try {
		const link = parseTextEditorExternalLink(new URL(input));
		return link.success ? link.href : null;
	} catch {
		return null;
	}
}
