import { act, render, screen, waitFor } from "@testing-library/react";
import { $getRoot, CONTROLLED_TEXT_INSERTION_COMMAND, getNearestEditorFromDOMNode } from "lexical";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { TextEditorLexical, type TextEditorData, type TextEditorLexicalRaw } from "./index";

const rangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");
beforeAll(async () => {
	vi.stubEnv("SSR", false);
	// jsdom не рассчитывает геометрию выделения. Отложенное подключение,
	// изменение документа и публичный callback проходят без подмены редактора.
	Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
	// Заранее загружаем настоящий client-модуль, чтобы время преобразования
	// импорта под параллельной нагрузкой не влияло на проверку onChange.
	await import("./TextEditorLexicalClient");
});
afterAll(() => {
	vi.unstubAllEnvs();
	if (rangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", rangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

describe("сериализация публичного TextEditorLexical.onChange", () => {
	it("публикует чистое JSON-дерево после ввода, сохраняя HTML и игнорируя изменение выделения", async () => {
		const onChange = vi.fn<(data: TextEditorData<TextEditorLexicalRaw>) => void>();
		render(
			<TextEditorLexical
				initialData={{ html: '<ol start="4"><li><strong>Начало</strong></li></ol>', raw: null }}
				onChange={onChange}
			/>
		);
		const input = await screen.findByRole("textbox");
		await waitFor(() => expect(input.textContent).toBe("Начало"));
		const editor = getNearestEditorFromDOMNode(input);
		if (!editor) throw new Error("Редактируемая область не подключена к Lexical");
		onChange.mockClear();
		await act(async () => editor.update(() => $getRoot().selectEnd(), { discrete: true }));
		expect(onChange).not.toHaveBeenCalled();

		await act(async () => {
			// Публичная команда заменяет только отсутствующий нативный ввод jsdom:
			// она проходит через штатное изменение документа и OnChangePlugin.
			editor.update(() => editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, " 👋 0"), { discrete: true });
		});
		expect(onChange).toHaveBeenCalledTimes(1);
		const changed = onChange.mock.lastCall?.[0];
		if (!changed) throw new Error("Редактор не опубликовал изменённый документ");
		const restored: unknown = JSON.parse(JSON.stringify(changed.raw));
		const expectedState: unknown = JSON.parse(JSON.stringify(editor.getEditorState().toJSON()));

		expect(changed.raw).toStrictEqual(restored);
		expect(changed.raw).toMatchObject({ format: "lexical", version: 1 });
		expect(changed.raw.editorState).toStrictEqual(expectedState);
		const html = new DOMParser().parseFromString(changed.html, "text/html");
		expect(html.body.textContent).toBe("Начало 👋 0");
		expect(html.querySelector("strong")?.textContent).toBe("Начало");
		expect(html.querySelector("ol")?.getAttribute("start")).toBe("4");
		editor.parseEditorState(JSON.stringify(changed.raw.editorState)).read(() => {
			expect($getRoot().getTextContent()).toBe("Начало 👋 0");
		});
	});
});
