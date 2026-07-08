import { useEffect, useRef } from "react";

import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot } from "lexical";

interface InitialHtmlPluginProps {
	initialHTML?: string;
	shouldSkip: boolean;
}

/**
 * Плагин Lexical для инициализации содержимого редактора из HTML-строки.
 */
export function InitialHtmlPlugin({ initialHTML, shouldSkip }: InitialHtmlPluginProps) {
	const [editor] = useLexicalComposerContext();
	const isAppliedRef = useRef(false);

	useEffect(() => {
		if (shouldSkip || !initialHTML || isAppliedRef.current || typeof window === "undefined") return;

		isAppliedRef.current = true;
		editor.update(() => {
			const root = $getRoot();
			const dom = new DOMParser().parseFromString(initialHTML, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);

			root.clear();
			if (nodes.length === 0) {
				root.append($createParagraphNode());
				return;
			}

			root.append(...nodes);
		});
	}, [editor, initialHTML, shouldSkip]);

	return null;
}
