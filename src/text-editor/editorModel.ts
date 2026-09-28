import { type ComponentProps, type ComponentType, type Ref } from "react";

import { type TextEditorBlockStyle } from "./model/textEditorTypes";
import { type LinkTypes } from "./toolbar/types";

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
	/** Сужает включённую группу blocks; отсутствие сохраняет прежний полный набор. Не фильтрует документ. */
	blockStyles?: readonly TextEditorBlockStyle[];
	links?: boolean;
	/** Сужает включённую группу links в каноническом порядке; пустой список скрывает группу. */
	linkTypes?: readonly LinkTypes[];
	history?: boolean;
	alignment?: boolean;
	inline?: boolean;
	tags?: boolean;
	/** Независимая кнопка очистки semantic tag; по умолчанию сохраняется для прежних consumers. */
	clearSemanticTag?: boolean;
}

/** Только атрибуты доступности editable: consumer не подменяет обработчики и DOM-контракт Lexical. */
export type TextEditorEditableProps = Readonly<
	Pick<ComponentProps<"div">, "id" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid" | "aria-required">
>;

/** Опции диалога внешней ссылки; не являются валидатором initial raw или вставленного документа. */
export type TextEditorExternalLinkOptions = Readonly<{
	/** false скрывает QR-переключатель и записывает qrCode=false при подтверждении; по умолчанию true. */
	allowQrCode?: boolean;
}>;

/** Очистка текущего документа без remount; история предыдущего текста также удаляется. */
export type TextEditorHandle = Readonly<{
	clear: () => void;
}>;

export interface LocalLinkDialogAdapterProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (url: string, ariaLabel: string) => void;
}

export interface TextEditorBusinessAdapters {
	LocalLinkDialogComponent?: ComponentType<LocalLinkDialogAdapterProps>;
}

export interface TextEditorCoreProps<TRaw = unknown> {
	/** Блокирует пользовательские изменения, но не imperative clear после подтверждения consumer. */
	readOnly?: boolean;
	/** Один начальный фокус новой сессии документа; по умолчанию false. Не действует при начальном readOnly. */
	autoFocus?: boolean;
	ref?: Ref<TextEditorHandle>;
	initialData: TextEditorData<TRaw>;
	onChange: (data: TextEditorData<TextEditorLexicalRaw>) => void;
	/** document сохраняет обычную панель; compact предназначен для встроенного короткого ввода без внешней рамки. */
	presentation?: "document" | "compact";
	/** null полностью убирает подсказку и её место; undefined сохраняет стандартную подсказку. */
	placeholder?: string | null;
	toolbarComponents?: TextEditorToolbarComponents;
	businessAdapters?: TextEditorBusinessAdapters;
	editableProps?: TextEditorEditableProps;
	externalLinkOptions?: TextEditorExternalLinkOptions;
}

export const isLexicalTextRaw = (raw: unknown): raw is TextEditorLexicalRaw => {
	if (!raw || typeof raw !== "object") return false;

	const value = raw as Partial<TextEditorLexicalRaw>;
	return value.format === "lexical" && value.version === 1 && !!value.editorState && typeof value.editorState === "object";
};
