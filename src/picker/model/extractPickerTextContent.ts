import { isValidElement, type ReactNode } from "react";

export function extractPickerTextContent(node: ReactNode): string | undefined {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		const values = node
			.map(extractPickerTextContent)
			.filter((value): value is string => Boolean(value))
			.map((value) => value.trim())
			.filter(Boolean);
		return values.length ? values.join(" ") : undefined;
	}

	if (isValidElement<{ children?: ReactNode; searchText?: unknown }>(node)) {
		if (typeof node.props.searchText === "string") {
			return node.props.searchText;
		}

		return extractPickerTextContent(node.props.children);
	}

	return undefined;
}
