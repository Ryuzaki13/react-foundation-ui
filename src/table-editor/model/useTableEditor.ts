import { useState } from "react";

import {
	assertTableDocument,
	expandTableDocumentRange,
	getTableDocumentCellRange,
	type TableDocument,
	type TableDocumentPosition,
	type TableDocumentRange
} from "@ryuzaki13/react-foundation-lib/table-document";

/** Локальный draft: серверные версии, сохранение и конфликты принадлежат host-приложению. */
export type TableEditorController<T> = {
	readonly document: TableDocument<T>;
	readonly selection: TableDocumentRange;
	readonly focus: TableDocumentPosition;
	readonly canUndo: boolean;
	readonly canRedo: boolean;
	readonly historyPosition: number;
	readonly historyLength: number;
	readonly error: string | null;
	readonly select: (position: TableDocumentPosition, extend?: boolean) => void;
	readonly change: (document: TableDocument<T>) => void;
	readonly execute: (command: (document: TableDocument<T>) => TableDocument<T>) => void;
	readonly undo: () => void;
	readonly redo: () => void;
};

/**
 * История хранит документы со структурным разделением, а не копии server cache.
 * Новый initialDocument применяется только при новом mount/key: refetch не
 * затирает ввод. Копировальный bounded-copy-stack не подходит — он дедуплицирует
 * элементы и не сохраняет ветку undo/redo. Здесь максимум 100 редакторских шагов.
 */
export function useTableEditor<T>(initialDocument: TableDocument<T>): TableEditorController<T> {
	const [state, setState] = useState(() => {
		assertTableDocument(initialDocument);
		return {
			documents: [initialDocument],
			index: 0,
			anchor: { row: 0, column: 0 },
			focus: { row: 0, column: 0 },
			error: null as string | null
		};
	});
	const document = state.documents[state.index];
	const select = (position: TableDocumentPosition, extend = false) => {
		const range = getTableDocumentCellRange(document, position);
		const focus = { row: range.row, column: range.column };
		setState((current) => ({ ...current, anchor: extend ? current.anchor : focus, focus, error: null }));
	};
	const change = (next: TableDocument<T>) => {
		assertTableDocument(next);
		setState((current) => {
			if (current.documents[current.index] === next) return current;
			const documents = [...current.documents.slice(0, current.index + 1), next].slice(-101);
			const position = {
				row: Math.min(current.focus.row, next.rows.length - 1),
				column: Math.min(current.focus.column, next.columns.length - 1)
			};
			const range = getTableDocumentCellRange(next, position);
			const focus = { row: range.row, column: range.column };
			return { documents, index: documents.length - 1, anchor: focus, focus, error: null };
		});
	};
	const travel = (direction: -1 | 1) =>
		setState((current) => {
			const index = Math.max(0, Math.min(current.index + direction, current.documents.length - 1));
			return { ...current, index, anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 }, error: null };
		});
	return {
		document,
		selection: expandTableDocumentRange(document, state.anchor, state.focus),
		focus: state.focus,
		canUndo: state.index > 0,
		canRedo: state.index < state.documents.length - 1,
		historyPosition: state.index,
		historyLength: state.documents.length,
		error: state.error,
		select,
		change,
		undo: () => travel(-1),
		redo: () => travel(1),
		execute: (command) => {
			try {
				change(command(document));
			} catch (error) {
				// Геометрические предусловия отклоняют команду, сохраняя draft и историю.
				setState((current) => ({ ...current, error: error instanceof Error ? error.message : "Не удалось изменить таблицу." }));
			}
		}
	};
}
