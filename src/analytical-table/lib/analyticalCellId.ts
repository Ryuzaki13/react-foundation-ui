/** Кодирование частей исключает коллизии между ID, содержащими разделители. */
export function analyticalCellId(instanceId: string, rowId: string, columnId: string) {
	return `${instanceId}:${encodeURIComponent(rowId)}:${encodeURIComponent(columnId)}`;
}
