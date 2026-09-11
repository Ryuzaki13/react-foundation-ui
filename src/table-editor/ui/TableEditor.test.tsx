import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TableEditorDemo } from "../stories/TableEditorDemo";

describe("редактор таблицы", () => {
	it("SSR содержит таблицу и значения без browser bootstrap", () => {
		const html = renderToString(<TableEditorDemo />);
		expect(html).toContain("Первый раздел");
		expect(html).toContain('role="grid"');
	});
	it("Shift selection, merge и split сохраняют покрытые значения", () => {
		render(<TableEditorDemo />);
		const grid = screen.getByRole("grid");
		const cells = within(grid).getAllByRole("gridcell");
		fireEvent.click(cells[0]);
		fireEvent.click(cells[5], { shiftKey: true });
		fireEvent.click(screen.getByRole("button", { name: "Объединить ячейки" }));
		expect(within(grid).getAllByRole("gridcell")).toHaveLength(9);
		expect(within(grid).getAllByRole("gridcell")[0].getAttribute("rowspan")).toBe("2");
		expect(within(grid).getAllByRole("gridcell")[0].getAttribute("colspan")).toBe("2");
		fireEvent.click(screen.getByRole("button", { name: "Разъединить ячейки" }));
		expect(within(grid).getAllByRole("gridcell")).toHaveLength(12);
		expect(within(grid).getByText("Второй раздел")).toBeTruthy();
	});
	it("стрелки управляют единственной tab-stop ячейкой и расширяют выделение", () => {
		render(<TableEditorDemo />);
		const first = screen.getAllByRole("columnheader")[0];
		expect(first.getAttribute("aria-label")).toBe("Строка 1, столбец 1: Раздел");
		expect(first.querySelector("span:not([inert])")?.textContent).toBe("Раздел");
		first.focus();
		fireEvent.keyDown(first, { key: "ArrowRight", shiftKey: true });
		expect(document.activeElement).toBe(screen.getAllByRole("columnheader")[1]);
		expect(screen.getByRole("grid").querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		expect(screen.getByRole("grid").querySelectorAll('[aria-selected="true"]')).toHaveLength(2);
	});
	it("изменение содержимого можно отменить и повторить", () => {
		render(<TableEditorDemo />);
		fireEvent.change(screen.getByRole("textbox", { name: "Содержимое ячейки" }), { target: { value: "Новое название" } });
		expect(within(screen.getByRole("grid")).getByRole("columnheader", { name: "Строка 1, столбец 1: Новое название" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
		expect(within(screen.getByRole("grid")).getByRole("columnheader", { name: "Строка 1, столбец 1: Раздел" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
		expect(within(screen.getByRole("grid")).getByRole("columnheader", { name: "Строка 1, столбец 1: Новое название" })).toBeTruthy();
	});
	it("удаление требует подтверждения, отмена диалога сохраняет таблицу", () => {
		render(<TableEditorDemo />);
		fireEvent.click(screen.getAllByRole("gridcell")[0]);
		fireEvent.click(screen.getByText("Строки и столбцы"));
		fireEvent.click(screen.getByRole("button", { name: "Удалить строку" }));
		expect(screen.getByRole("dialog")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Не удалять" }));
		expect(screen.getAllByRole("gridcell")).toHaveLength(12);
	});
	it("удаление объединённой группы отменяется вместе с её скрытым содержимым", () => {
		render(<TableEditorDemo />);
		const grid = screen.getByRole("grid");
		const cells = within(grid).getAllByRole("gridcell");
		fireEvent.click(cells[0]);
		fireEvent.click(cells[5], { shiftKey: true });
		fireEvent.click(screen.getByRole("button", { name: "Объединить ячейки" }));
		fireEvent.click(screen.getByText("Строки и столбцы"));
		fireEvent.click(screen.getByRole("button", { name: "Удалить строку" }));
		expect(screen.getByText(/Будет удалено 2 строк/)).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Удалить группу" }));
		expect(within(grid).getAllByRole("gridcell")).toHaveLength(4);
		fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
		expect(within(grid).getAllByRole("gridcell")).toHaveLength(9);
		fireEvent.click(within(grid).getAllByRole("gridcell")[0]);
		fireEvent.click(screen.getByRole("button", { name: "Разъединить ячейки" }));
		expect(within(grid).getByText("Второй раздел")).toBeTruthy();
	});
	it("touch-переключатель расширяет диапазон без Shift", () => {
		render(<TableEditorDemo />);
		const grid = screen.getByRole("grid");
		fireEvent.click(within(grid).getAllByRole("gridcell")[0]);
		fireEvent.click(screen.getByRole("checkbox", { name: "Выделять диапазон" }));
		fireEvent.click(within(grid).getAllByRole("gridcell")[5]);
		expect(grid.querySelectorAll('[aria-selected="true"]')).toHaveLength(4);
	});
});
