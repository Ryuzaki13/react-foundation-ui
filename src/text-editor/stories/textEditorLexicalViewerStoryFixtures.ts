import {
	IS_BOLD,
	IS_CODE,
	IS_HIGHLIGHT,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_SUBSCRIPT,
	IS_SUPERSCRIPT,
	IS_UNDERLINE,
	type SerializedTextNode
} from "lexical";

import { type TextEditorLexicalRaw } from "../index";

const elementFields = { direction: null, format: "", indent: 0, version: 1 } as const;

/** Фиксированные сериализованные данные не создают редактор, selection или browser effects. */
function createViewerStoryText(text: string, format = 0): SerializedTextNode {
	return { type: "text", version: 1, detail: 0, format, mode: "normal", style: "", text };
}

function createViewerStoryDocument(children: readonly unknown[]): TextEditorLexicalRaw {
	return { format: "lexical", version: 1, editorState: { root: { ...elementFields, type: "root", children } } };
}

export const richTextViewerStoryRaw = createViewerStoryDocument([
	{ ...elementFields, type: "heading", tag: "h2", children: [createViewerStoryText("Сохранённый документ")] },
	{
		...elementFields,
		type: "paragraph",
		children: [
			createViewerStoryText("Обычный текст, "),
			createViewerStoryText("жирный", IS_BOLD),
			createViewerStoryText(", "),
			createViewerStoryText("курсив", IS_ITALIC),
			createViewerStoryText(", "),
			createViewerStoryText("подчёркнутый", IS_UNDERLINE),
			createViewerStoryText(" и "),
			createViewerStoryText("зачёркнутый", IS_STRIKETHROUGH),
			createViewerStoryText("."),
			{ type: "linebreak", version: 1 },
			createViewerStoryText("Код: "),
			createViewerStoryText("const answer = 42", IS_CODE),
			createViewerStoryText(". "),
			createViewerStoryText("Важная мысль выделена", IS_HIGHLIGHT),
			createViewerStoryText(". Индексы: H"),
			createViewerStoryText("2", IS_SUBSCRIPT),
			createViewerStoryText("O и x"),
			createViewerStoryText("2", IS_SUPERSCRIPT),
			createViewerStoryText("."),
			{ type: "linebreak", version: 1 },
			createViewerStoryText("Сочетание жирного, курсива и подчёркивания", IS_BOLD | IS_ITALIC | IS_UNDERLINE)
		]
	},
	{
		...elementFields,
		type: "quote",
		children: [createViewerStoryText("Это просмотр сохранённого документа: ввод, курсор редактора и панель инструментов отсутствуют.")]
	},
	{
		...elementFields,
		type: "paragraph",
		format: "right",
		children: [createViewerStoryText("Выравнивание берётся только из поддерживаемого профиля.")]
	}
]);

export const nestedListsViewerStoryRaw = createViewerStoryDocument([
	{ ...elementFields, type: "heading", tag: "h2", children: [createViewerStoryText("Вложенность и нумерация")] },
	{
		...elementFields,
		type: "list",
		listType: "number",
		tag: "ol",
		start: 4,
		children: [
			{ ...elementFields, type: "listitem", value: 4, children: [createViewerStoryText("Список начинается с четвёртого пункта.")] },
			{
				...elementFields,
				type: "listitem",
				value: 5,
				children: [
					{
						...elementFields,
						type: "list",
						listType: "bullet",
						tag: "ul",
						start: 1,
						children: [
							{
								...elementFields,
								type: "listitem",
								value: 1,
								children: [createViewerStoryText("Вложенный маркированный пункт.")]
							},
							{
								...elementFields,
								type: "listitem",
								value: 2,
								children: [
									{
										...elementFields,
										type: "list",
										listType: "number",
										tag: "ol",
										start: 7,
										children: [
											{
												...elementFields,
												type: "listitem",
												value: 7,
												children: [createViewerStoryText("Третий уровень: номер семь.")]
											},
											{
												...elementFields,
												type: "listitem",
												value: 9,
												children: [createViewerStoryText("Явный value сохраняет номер девять.")]
											}
										]
									}
								]
							}
						]
					}
				]
			},
			{
				...elementFields,
				type: "listitem",
				value: 8,
				children: [createViewerStoryText("Явный value возвращает внешний список к номеру восемь.")]
			}
		]
	}
]);

export const accessibleLinksViewerStoryRaw = createViewerStoryDocument([
	{
		...elementFields,
		type: "paragraph",
		children: [
			createViewerStoryText("Абсолютная HTTPS-ссылка: "),
			{
				...elementFields,
				type: "accessible-link",
				url: "https://example.com/document",
				target: "_blank",
				rel: null,
				title: null,
				ariaLabel: "Пример документа — новая вкладка",
				qrCode: false,
				add: null,
				text: null,
				children: [createViewerStoryText("Пример документа", IS_BOLD)]
			},
			createViewerStoryText(". При переходе откроется новая вкладка с защитным rel."),
			{ type: "linebreak", version: 1 },
			createViewerStoryText("HTTP-ссылка в текущей вкладке: "),
			{
				...elementFields,
				type: "accessible-link",
				url: "http://example.com/reference",
				target: "_self",
				rel: null,
				title: null,
				ariaLabel: null,
				qrCode: false,
				add: null,
				text: null,
				children: [createViewerStoryText("Справочный пример")]
			}
		]
	}
]);

export const narrowContentViewerStoryRaw = createViewerStoryDocument([
	{ ...elementFields, type: "heading", tag: "h3", children: [createViewerStoryText("Длинный текст в узкой области")] },
	{
		...elementFields,
		type: "paragraph",
		children: [createViewerStoryText("Обычный текст переносится внутри доступной ширины без изменения сохранённых данных. ".repeat(6))]
	},
	{
		...elementFields,
		type: "paragraph",
		children: [createViewerStoryText("ОченьДлиннаяПоследовательностьБезПробелов".repeat(8))]
	},
	{
		...elementFields,
		type: "paragraph",
		children: [createViewerStoryText("long_identifier_without_whitespace_".repeat(6), IS_CODE)]
	}
]);

/** Неизвестный узел должен отвергнуть весь документ, включая предыдущий корректный абзац. */
export const unsupportedViewerStoryRaw = createViewerStoryDocument([
	{ ...elementFields, type: "paragraph", children: [createViewerStoryText("Этот фрагмент не должен появляться частично.")] },
	{ type: "unsupported-node", version: 1 }
]);

export const emptyViewerStoryRaw = createViewerStoryDocument([]);
