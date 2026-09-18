import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Detail } from "./Detail";

describe("Detail", () => {
	it("сохраняет списковую семантику по умолчанию и передаёт ARIA-атрибуты корневому элементу", () => {
		const { container } = render(
			<Detail aria-label="Сводка" aria-describedby="detail-description">
				<Detail.Item label="Статус" value="Активен" />
			</Detail>
		);

		const root = container.firstElementChild;

		expect(root?.tagName).toBe("UL");
		expect(root?.getAttribute("aria-label")).toBe("Сводка");
		expect(root?.getAttribute("aria-describedby")).toBe("detail-description");
		expect(root?.firstElementChild?.tagName).toBe("LI");
	});

	it("использует dl, dt и dd в режиме detail", () => {
		const { container } = render(
			<Detail semantic="detail">
				<Detail.Item label="Номер" value="DOC-001" />
			</Detail>
		);

		const root = container.firstElementChild;
		const item = root?.firstElementChild;

		expect(root?.tagName).toBe("DL");
		expect(item?.tagName).toBe("DIV");
		expect(item?.children[0]?.tagName).toBe("DT");
		expect(item?.children[0]?.textContent).toBe("Номер:");
		expect(item?.children[1]?.tagName).toBe("DD");
		expect(item?.children[1]?.textContent).toBe("DOC-001");
	});

	it("наследует настройку двоеточия и позволяет переопределить её у элемента", () => {
		render(
			<Detail semantic="detail" withColon={false}>
				<Detail.Item label="Без двоеточия" value="Первое" />
				<Detail.Item withColon label="С двоеточием" value="Второе" />
			</Detail>
		);

		const terms = screen.getAllByRole("term");

		expect(terms.map((term) => term.textContent)).toEqual(["Без двоеточия", "С двоеточием:"]);
	});

	it("скрывает визуальный маркер обязательности от screen reader и добавляет текстовое описание", () => {
		render(
			<Detail semantic="detail">
				<Detail.Item required label="Статус" value="Активен" />
			</Detail>
		);

		const marker = screen.getByText("*");
		const description = screen.getByText("(Обязательное поле)", { exact: false });

		expect(marker.getAttribute("aria-hidden")).toBe("true");
		expect(marker.classList.contains("statusError")).toBe(true);
		expect(description.classList.contains("visuallyHidden")).toBe(true);
	});

	it.each([
		[1, "1"],
		[3.9, "3"],
		[10, "5"],
		[0, "1"],
		[Number.NaN, "1"],
		[Number.POSITIVE_INFINITY, "1"]
	])("нормализует columnCount=%s до %s", (columnCount, expected) => {
		const { container } = render(
			<Detail columnCount={columnCount}>
				<Detail.Item label="Статус" value="Активен" />
			</Detail>
		);

		expect((container.firstElementChild as HTMLElement).style.columnCount).toBe(expected);
	});

	it("сохраняет автономный fallback Detail.Item без семантического контейнера", () => {
		const { container } = render(<Detail.Item label="Статус" value="Активен" />);

		expect(container.firstElementChild?.tagName).toBe("DIV");
		expect(container.firstElementChild?.children[0]?.tagName).toBe("DIV");
		expect(container.firstElementChild?.children[1]?.tagName).toBe("DIV");
	});
});
