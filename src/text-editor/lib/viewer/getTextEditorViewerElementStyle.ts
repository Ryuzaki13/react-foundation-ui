import { type CSSProperties } from "react";

import { type TextEditorViewerElement } from "../../model/textEditorViewerTypes";

/** CSS получает только проверенные enum/число; произвольный style из raw сюда не попадает. */
export function getTextEditorViewerElementStyle(element: TextEditorViewerElement): CSSProperties {
	return {
		textAlign: element.alignment || undefined,
		marginInlineStart: element.indent ? `min(${element.indent} * var(--space-lg), 25%)` : undefined
	};
}
