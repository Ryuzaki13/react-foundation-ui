import { httpUrlSchema } from "@ryuzaki13/react-foundation-lib/validators/schema";

type TextEditorExternalLinkResult =
	{ readonly success: true; readonly value: string; readonly href: string } | { readonly success: false; readonly error: string };

/** Ссылки редактора и viewer используют полный HTTP(S)-адрес без учётных данных. */
export function parseTextEditorExternalLink(input: string | URL): TextEditorExternalLinkResult {
	// URL нормализует обратную косую черту в пути и оставляет её в запросе и фрагменте.
	const address = typeof input === "string" ? input : input.href.replaceAll("\\", "%5C");
	const result = httpUrlSchema.safeParse(address);
	if (!result.success) return { success: false, error: result.error.issues[0]?.message ?? "Некорректный формат URL." };

	const url = typeof input === "string" ? new URL(result.data) : input;
	if (url.username || url.password) return { success: false, error: "Укажите ссылку без имени пользователя и пароля." };

	return { success: true, value: result.data, href: typeof input === "string" ? url.href : result.data };
}
