/** Сохраняет доступное имя fullscreen-поверхности при отсутствующем заголовке. */
export function resolveFullscreenAriaLabel(title: string, description: string): string {
	const trimmedTitle = title.trim();
	return trimmedTitle ? `${trimmedTitle}. ${description}` : description;
}
