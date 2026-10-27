import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { type TextEditorClipboardProfile } from "../../editorModel";
import { installTextEditorClipboardProfile } from "../../model/installTextEditorClipboardProfile";

type TextEditorClipboardProfilePluginProps = {
	readonly profile: TextEditorClipboardProfile;
	readonly onError: (error: Error) => void;
};

/** Монтируется только для явно выбранной consumer-политики вставки. */
export function TextEditorClipboardProfilePlugin({ profile, onError }: TextEditorClipboardProfilePluginProps) {
	const [editor] = useLexicalComposerContext();
	useEffect(() => installTextEditorClipboardProfile(editor, profile, onError), [editor, profile, onError]);
	return null;
}
