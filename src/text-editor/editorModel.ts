import { ComponentType } from "react";

export type TextEditorLexicalRaw = {
	format: "lexical";
	version: 1;
	editorState: Record<string, unknown>;
};

export type TextEditorData<TRaw = unknown> = {
	html: string;
	raw: TRaw;
};

export interface TextEditorToolbarComponents {
	blocks?: boolean;
	links?: boolean;
	history?: boolean;
	alignment?: boolean;
	inline?: boolean;
	tags?: boolean;
}

export interface LocalLinkDialogAdapterProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (url: string, ariaLabel: string) => void;
}

export interface TextEditorBusinessAdapters {
	LocalLinkDialogComponent?: ComponentType<LocalLinkDialogAdapterProps>;
}

export interface TextEditorCoreProps<TRaw = unknown> {
	initialData: TextEditorData<TRaw>;
	onChange: (data: TextEditorData<TextEditorLexicalRaw>) => void;
	toolbarComponents?: TextEditorToolbarComponents;
	businessAdapters?: TextEditorBusinessAdapters;
}

export const isLexicalTextRaw = (raw: unknown): raw is TextEditorLexicalRaw => {
	if (!raw || typeof raw !== "object") return false;

	const value = raw as Partial<TextEditorLexicalRaw>;
	return value.format === "lexical" && value.version === 1 && !!value.editorState && typeof value.editorState === "object";
};
