import { mergeTableDocumentCells, updateTableDocumentCell } from "@ryuzaki13/react-foundation-lib/table-document";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { tableEditorDemoDocument } from "../stories/tableEditorDemoDocument";

import { useTableEditor } from "./useTableEditor";

describe("история редактора таблицы", () => {
	it("undo/redo и новая ветка не теряют исходный документ", () => {
		const { result } = renderHook(() => useTableEditor(tableEditorDemoDocument));
		act(() => result.current.execute((document) => updateTableDocumentCell(document, { row: 1, column: 0 }, "Изменено")));
		expect(result.current.document.rows[1].cells[0].value).toBe("Изменено");
		act(() => result.current.undo());
		expect(result.current.document).toBe(tableEditorDemoDocument);
		act(() => result.current.redo());
		expect(result.current.document.rows[1].cells[0].value).toBe("Изменено");
		act(() => result.current.undo());
		act(() => result.current.execute((document) => updateTableDocumentCell(document, { row: 2, column: 1 }, "Другая ветка")));
		expect(result.current.canRedo).toBe(false);
		expect(result.current.document.rows[1].cells[0].value).toBe(tableEditorDemoDocument.rows[1].cells[0].value);
	});
	it("отклонённая команда не меняет историю или ввод", () => {
		const { result } = renderHook(() => useTableEditor(tableEditorDemoDocument));
		act(() => result.current.execute((document) => mergeTableDocumentCells(document, { row: 0, column: 0 }, { row: 1, column: 0 })));
		expect(result.current.error).toMatch(/заголовок/);
		expect(result.current.document).toBe(tableEditorDemoDocument);
		expect(result.current.historyLength).toBe(1);
	});
	it("refetch initialDocument не затирает локальный draft", () => {
		const { result, rerender } = renderHook(({ initial }) => useTableEditor(initial), {
			initialProps: { initial: tableEditorDemoDocument }
		});
		act(() => result.current.execute((document) => updateTableDocumentCell(document, { row: 1, column: 0 }, "Локально")));
		rerender({ initial: { ...tableEditorDemoDocument, caption: "Другая версия" } });
		expect(result.current.document.rows[1].cells[0].value).toBe("Локально");
	});
	it("история ограничена 100 шагами и не содержит no-op", () => {
		const { result } = renderHook(() => useTableEditor(tableEditorDemoDocument));
		act(() => result.current.change(result.current.document));
		expect(result.current.historyLength).toBe(1);
		for (let i = 0; i < 105; i++)
			act(() => result.current.execute((document) => updateTableDocumentCell(document, { row: 1, column: 0 }, String(i))));
		expect(result.current.historyLength).toBe(101);
		expect(result.current.historyPosition).toBe(100);
	});
});
