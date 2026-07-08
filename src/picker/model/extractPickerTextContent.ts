import { ReactNode } from "react";

export function extractPickerTextContent(node: ReactNode): string | undefined {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		const values = node.map(extractPickerTextContent).filter((value): value is string => Boolean(value));
		return values.length ? values.join(" ") : undefined;
	}

	return undefined;
}
