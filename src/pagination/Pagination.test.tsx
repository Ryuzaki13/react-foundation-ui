import { fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
	it("публикует выбранный номер и оставляет текущее состояние у потребителя", () => {
		const onPageChange = vi.fn();
		const view = render(<Pagination page={1} pageCount={43} onPageChange={onPageChange} aria-label="Разделы" id="example-pages" />);
		const navigation = view.getByRole("navigation");
		const lastPage = navigation.querySelector<HTMLButtonElement>('[data-page="43"]');

		if (!lastPage) {
			throw new Error("Последняя страница недоступна.");
		}

		expect(navigation.id).toBe("example-pages");
		expect(navigation.getAttribute("aria-label")).toBe("Разделы");
		expect(navigation.querySelector('[aria-current="page"]')?.getAttribute("data-page")).toBe("1");

		fireEvent.click(lastPage);

		expect(onPageChange).toHaveBeenCalledExactlyOnceWith(43);
		expect(navigation.querySelector('[aria-current="page"]')?.getAttribute("data-page")).toBe("1");

		view.rerender(<Pagination page={43} pageCount={43} onPageChange={onPageChange} />);

		expect(navigation.querySelector('[aria-current="page"]')?.getAttribute("data-page")).toBe("43");
		expect(navigation.querySelector<HTMLButtonElement>('[data-action="pagination-next"]')?.disabled).toBe(true);
	});

	it("переходит к соседним страницам и не повторяет выбор текущей", () => {
		const onPageChange = vi.fn();
		const view = render(<Pagination page={22} pageCount={43} onPageChange={onPageChange} />);
		const previous = view.container.querySelector<HTMLButtonElement>('[data-action="pagination-previous"]');
		const next = view.container.querySelector<HTMLButtonElement>('[data-action="pagination-next"]');
		const current = view.container.querySelector<HTMLButtonElement>('[data-page="22"]');

		if (!previous || !next || !current) {
			throw new Error("Навигация страницы не подключена.");
		}

		fireEvent.click(previous);
		fireEvent.click(next);
		fireEvent.click(current);

		expect(onPageChange.mock.calls).toEqual([[21], [23]]);
	});

	it("сохраняет нативное управление с клавиатуры", async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();
		const view = render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);
		const previous = view.container.querySelector<HTMLButtonElement>('[data-action="pagination-previous"]');

		if (!previous) {
			throw new Error("Переход к предыдущей странице недоступен.");
		}

		await user.tab();
		expect(document.activeElement).toBe(previous);

		await user.keyboard("{Enter}");
		expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1);
	});

	it("отключает все действия при ожидании данных", () => {
		const onPageChange = vi.fn();
		const view = render(<Pagination page={3} pageCount={43} onPageChange={onPageChange} disabled />);
		const buttons = view.getAllByRole("button");

		for (const button of buttons) {
			expect(button.hasAttribute("disabled")).toBe(true);
			fireEvent.click(button);
		}

		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("не вызывает callback при уменьшении количества страниц", () => {
		const onPageChange = vi.fn();
		const view = render(<Pagination page={43} pageCount={2} onPageChange={onPageChange} />);

		expect(view.container.querySelector('[aria-current="page"]')?.getAttribute("data-page")).toBe("2");
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it.each([0, 1])("не показывает лишнюю навигацию при количестве %i", (pageCount) => {
		const onPageChange = vi.fn();
		const view = render(<Pagination page={1} pageCount={pageCount} onPageChange={onPageChange} />);

		expect(view.queryByRole("navigation")).toBeNull();
		expect(onPageChange).not.toHaveBeenCalled();
	});

	it("представляет пропуски неинтерактивным текстом из трёх точек", () => {
		const view = render(<Pagination page={22} pageCount={43} onPageChange={vi.fn()} />);
		const gaps = view.container.querySelectorAll('[data-ui="pagination-gap"]');

		expect(gaps).toHaveLength(2);

		for (const gap of gaps) {
			expect(gap.textContent).toBe("...");
			expect(gap.getAttribute("aria-hidden")).toBe("true");
			expect(gap.hasAttribute("tabindex")).toBe(false);
		}
	});
});
