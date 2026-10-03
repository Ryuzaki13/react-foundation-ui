import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createListTestItems } from "./test-fixtures/createListTestItems";
import { installListTestEnvironment } from "./test-fixtures/installListTestEnvironment";
import { ListStatefulTestRow } from "./test-fixtures/ListStatefulTestRow";
import { ListTestContent } from "./test-fixtures/ListTestContent";

import { List } from "./index";

let environment: ReturnType<typeof installListTestEnvironment>;

beforeEach(() => {
	environment = installListTestEnvironment();
});
afterEach(() => {
	environment.restore();
});

describe("List.VirtualizedContent: stable-key scroll anchor", () => {
	it("пустая первичная загрузка не объявляет empty-состояние и остаётся именованной областью", () => {
		const mounted = render(<ListTestContent items={[]} isLoading />);
		const viewport = screen.getByRole("region", { name: "changing-source" });
		expect(viewport.getAttribute("tabindex")).toBe("0");
		expect(viewport.querySelector("[data-list-test-empty]")).toBeNull();
		expect(viewport.querySelector("[data-list-test-item]")).toBeNull();
		mounted.rerender(<ListTestContent items={[]} />);
		expect(viewport.querySelector("[data-list-test-empty]")).not.toBeNull();
	});

	it("перестановка сохраняет DOM и локальное состояние смонтированной строки по её ключу", () => {
		const items = createListTestItems(40);
		const mounted = render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <ListStatefulTestRow item={item} />}
				aria-label="stateful-source"
			/>
		);
		const viewport = screen.getByRole("region", { name: "stateful-source" });
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		const button = viewport.querySelector<HTMLButtonElement>('[data-list-test-action="item-10"]');
		if (!button) throw new Error("Stateful-строка не попала в видимое окно.");
		fireEvent.click(button);
		expect(button.textContent).toBe("1");
		mounted.rerender(
			<List.VirtualizedContent
				items={[...items].reverse()}
				getKey={(item) => item.id}
				render={(item) => <ListStatefulTestRow item={item} />}
				aria-label="stateful-source"
			/>
		);
		expect(viewport.querySelector('[data-list-test-action="item-10"]')).toBe(button);
		fireEvent.click(button);
		expect(button.textContent).toBe("2");
	});

	it("prepend сохраняет ключ первой видимой строки и смещение внутри неё", () => {
		const items = createListTestItems(40);
		const mounted = render(<ListTestContent items={items} />);
		const viewport = screen.getByRole("region", { name: "changing-source" });
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		mounted.rerender(<ListTestContent items={[{ id: "prepended", label: "Новая строка" }, ...items]} />);
		expect(viewport.scrollTop).toBe(1357);
		expect(viewport.querySelector('[data-list-test-item="item-10"]')).not.toBeNull();
	});

	it("перестановка вокруг anchor не заменяет его индексом и учитывает новую позицию", () => {
		const items = createListTestItems(40);
		const mounted = render(<ListTestContent items={items} />);
		const viewport = screen.getByRole("region", { name: "changing-source" });
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		mounted.rerender(<ListTestContent items={[...items.slice(5), ...items.slice(0, 5)]} />);
		expect(viewport.scrollTop).toBe(637);
		expect(viewport.querySelector('[data-list-test-item="item-10"]')).not.toBeNull();
	});

	it("удаление anchor выбирает ближайший surviving key прежнего порядка, при равенстве следующий", () => {
		const items = createListTestItems(40);
		const mounted = render(<ListTestContent items={items} />);
		const viewport = screen.getByRole("region", { name: "changing-source" });
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		mounted.rerender(<ListTestContent items={items.filter((item) => item.id !== "item-10")} />);
		expect(viewport.scrollTop).toBe(1237);
		expect(viewport.querySelector('[data-list-test-item="item-10"]')).toBeNull();
		expect(viewport.querySelector('[data-list-test-item="item-11"]')).not.toBeNull();
	});

	it("preserveScrollAnchor=false сохраняет числовую позицию при prepend", () => {
		const items = createListTestItems(40);
		const mounted = render(<ListTestContent items={items} preserveScrollAnchor={false} />);
		const viewport = screen.getByRole("region", { name: "changing-source" });
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		mounted.rerender(<ListTestContent items={[{ id: "new", label: "Новая строка" }, ...items]} preserveScrollAnchor={false} />);
		expect(viewport.scrollTop).toBe(1237);
	});

	it("измеренные разные высоты принадлежат ключам: перестановка и изменение строки не сдвигают anchor", () => {
		const items = createListTestItems(40);
		environment.setRowHeight("item-0", 240);
		const mounted = render(<ListTestContent items={items} />);
		act(environment.flushResizeObservers);
		fireEvent.scroll(screen.getByRole("region", { name: "changing-source" }), { target: { scrollTop: 243 } });
		const viewport = screen.getByRole("region", { name: "changing-source" });
		const second = items[1];
		if (!second) throw new Error("Не создана строка перестановки.");
		const reordered = [second, items[0], ...items.slice(2)].filter((item) => item !== undefined);
		mounted.rerender(<ListTestContent items={reordered} />);
		expect(viewport.scrollTop).toBe(3);
		fireEvent.scroll(viewport, { target: { scrollTop: 123 } });
		mounted.rerender(<ListTestContent items={reordered.filter((item) => item.id !== "item-1")} />);
		expect(viewport.scrollTop).toBe(3);
		mounted.rerender(
			<ListTestContent items={reordered.map((item) => (item.id === "item-2" ? { ...item, label: "Обновлено" } : item))} />
		);
		expect(viewport.scrollTop).toBe(123);
		expect(viewport.querySelector('[data-list-test-item="item-0"]')).not.toBeNull();
	});

	it("resetKey явно возвращает начало без замены viewport, empty→данные и loading с данными сохраняют доступность", () => {
		const items = createListTestItems(40);
		const mounted = render(<ListTestContent items={items} resetKey={null} />);
		const viewport = screen.getByRole("region", { name: "changing-source" });
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		mounted.rerender(<ListTestContent items={items} resetKey="next-dataset" />);
		expect(screen.getByRole("region", { name: "changing-source" })).toBe(viewport);
		expect(viewport.scrollTop).toBe(0);
		mounted.rerender(<ListTestContent items={items} resetKey="next-dataset" isLoading />);
		expect(viewport.querySelector('[data-list-test-item="item-0"]')).not.toBeNull();
		mounted.rerender(<ListTestContent items={[]} resetKey="next-dataset" />);
		expect(viewport.querySelector("[data-list-test-item]")).toBeNull();
		expect(viewport.querySelector("[data-list-test-empty]")).not.toBeNull();
		mounted.rerender(<ListTestContent items={items} resetKey="next-dataset" />);
		expect(viewport.querySelector('[data-list-test-item="item-0"]')).not.toBeNull();
	});
});
