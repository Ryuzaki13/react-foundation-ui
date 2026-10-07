/** DOM мог обновиться во время parking; прежний offset ограничивается текущей длиной того же node. */
export function getStablePortalBoundaryOffset(node: Node, offset: number): number {
	return Math.min(offset, node.nodeType === Node.TEXT_NODE ? (node.textContent?.length ?? 0) : node.childNodes.length);
}
