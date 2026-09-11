import { type TableDocument } from "@ryuzaki13/react-foundation-lib/table-document";

/** Детерминированная демонстрация: без UUID во время SSR/render и без данных приложения. */
export const tableEditorDemoDocument: TableDocument<string> = {
	version: 1,
	caption: "Учебная таблица",
	columns: Array.from({ length: 4 }, (_, index) => ({ id: `column-${index}`, width: 180 })),
	rows: [
		["Раздел", "Показатель", "План", "Результат"],
		["Первый раздел", "Участники", "24", "26"],
		["Второй раздел", "Занятия", "12", "12"],
		["Третий раздел", "Проекты", "4", "5"]
	].map((values, row) => ({ id: `row-${row}`, cells: values.map((value, column) => ({ id: `cell-${row}-${column}`, value })) })),
	merges: [],
	headerRowCount: 1,
	hideHeaders: false,
	showRowNumbers: false
};
