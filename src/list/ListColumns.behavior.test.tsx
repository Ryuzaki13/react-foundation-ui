import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installListTestEnvironment } from "./test-fixtures/installListTestEnvironment";

import { List } from "./index";

let environment: ReturnType<typeof installListTestEnvironment>;

beforeEach(() => {
	environment = installListTestEnvironment();
});
afterEach(() => {
	environment.restore();
});

/** Одинаковая геометрия изолирует упаковку строк от изменения размеров карточек. */
function createItems(count: number) {
	return Array.from({ length: count }, (_, index) => ({ id: `item-${index}`, group: index < count / 2 ? "first" : "second" }));
}

describe("List: встроенные столбцы и группы", () => {
	it("Content пакует исходные items и сохраняет семантику каждой записи", () => {
		const items = createItems(5);
		render(
			<List.Content
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span>{item.id}</span>}
				columns={{ count: 2, minItemWidth: "12rem" }}
			/>
		);
		const entries = screen.getAllByRole("listitem");
		expect(entries.map((entry) => entry.textContent)).toEqual(items.map((item) => item.id));
		expect(entries.map((entry) => entry.getAttribute("aria-posinset"))).toEqual(["1", "2", "3", "4", "5"]);
		expect(entries.every((entry) => entry.getAttribute("aria-setsize") === "5")).toBe(true);
		expect(entries[0]?.parentElement).toBe(entries[1]?.parentElement);
		expect(entries[2]?.parentElement).toBe(entries[3]?.parentElement);
		expect(entries[0]?.parentElement).not.toBe(entries[2]?.parentElement);
		expect(entries[4]?.parentElement).not.toBe(entries[3]?.parentElement);
		expect(entries.every((entry) => entry.closest("li")?.getAttribute("role") === "presentation")).toBe(true);
	});

	it("Content объединяет повторные группы, передаёт им исходные items и не дополняет строку другой группой", () => {
		const items = [
			{ id: "a-1", group: "a" },
			{ id: "b-1", group: "b" },
			{ id: "a-2", group: "a" },
			{ id: "b-2", group: "b" },
			{ id: "a-3", group: "a" }
		];
		const renderGroup = vi.fn((key: string, grouped: readonly (typeof items)[number][]) => (
			<h3>
				{key}:{grouped.length}
			</h3>
		));
		render(
			<List.Content
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span>{item.id}</span>}
				columns={{ count: 2 }}
				grouping={{ getKey: (item) => item.group, render: renderGroup }}
			/>
		);
		const entries = screen.getAllByRole("listitem");
		expect(entries.map((entry) => entry.textContent)).toEqual(["a-1", "a-2", "a-3", "b-1", "b-2"]);
		expect(entries.map((entry) => entry.getAttribute("aria-posinset"))).toEqual(["1", "2", "3", "4", "5"]);
		expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual(["a:3", "b:2"]);
		expect(renderGroup.mock.calls).toEqual([
			["a", [items[0], items[2], items[4]]],
			["b", [items[1], items[3]]]
		]);
		expect(entries[2]?.parentElement).not.toBe(entries[3]?.parentElement);
		expect(
			screen.getAllByRole("heading").every((heading) => heading.closest('[role="listitem"], li:not([role="presentation"])') === null)
		).toBe(true);
	});

	it("grouping доступен без columns и сохраняет по одной записи в строке", () => {
		const items = [
			{ id: "a-1", group: "a" },
			{ id: "b-1", group: "b" },
			{ id: "a-2", group: "a" }
		];
		render(
			<List.Content
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span>{item.id}</span>}
				grouping={{ getKey: (item) => item.group, render: (key) => <h3>{key}</h3> }}
			/>
		);
		const entries = screen.getAllByRole("listitem");
		expect(entries.map((entry) => entry.textContent)).toEqual(["a-1", "a-2", "b-1"]);
		expect(entries.every((entry) => entry.tagName === "LI")).toBe(true);
		expect(entries.map((entry) => entry.getAttribute("aria-posinset"))).toEqual(["1", "2", "3"]);
	});

	it("VirtualizedContent ограничивает DOM строками и сообщает все исходные ключи пересекающих viewport строк", () => {
		const items = createItems(200);
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.id}</span>}
				columns={{ count: 2 }}
				overscan={0}
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		const viewport = screen.getByRole("region");
		expect(screen.getAllByRole("listitem")).toHaveLength(4);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1", "item-2", "item-3"]);
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		expect(screen.getAllByRole("listitem")).toHaveLength(6);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-20", "item-21", "item-22", "item-23", "item-24", "item-25"]);
		expect(screen.getAllByRole("listitem").every((entry) => entry.getAttribute("aria-setsize") === "200")).toBe(true);
		expect(screen.getAllByRole("listitem").map((entry) => entry.getAttribute("aria-posinset"))).toEqual([
			"21",
			"22",
			"23",
			"24",
			"25",
			"26"
		]);
	});

	it("заголовки и sentinel не попадают в visible keys или listitem", () => {
		const items = createItems(8);
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.id}</span>}
				columns={{ count: 2 }}
				grouping={{ getKey: (item) => item.group, render: (key) => <h3 data-list-test-item={`heading-${key}`}>{key}</h3> }}
				overscan={0}
				hasNextPage
				fetchNextPage={async () => undefined}
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-1"]);
		expect(screen.getAllByRole("heading")).toHaveLength(1);
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 720 } });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		expect(screen.queryAllByRole("listitem")).toHaveLength(0);
	});

	it("grouping без columns сохраняет sentinel служебной строкой без роли listitem", () => {
		const items = createItems(4);
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.id}</span>}
				grouping={{
					getKey: (item) => item.group,
					render: (key) => <h3 data-list-test-item={`heading-${key}`}>{key}</h3>
				}}
				overscan={0}
				hasNextPage
				fetchNextPage={async () => undefined}
			/>
		);
		const viewport = screen.getByRole("region");
		fireEvent.scroll(viewport, { target: { scrollTop: 720 } });
		expect(viewport.querySelector("ul")?.children).toHaveLength(1);
		expect(screen.queryAllByRole("listitem")).toHaveLength(0);
	});

	it("один prepend перепаковывает строки, сохраняя исходный item anchor и смещение", () => {
		const items = createItems(80);
		const props = {
			getKey: (item: (typeof items)[number]) => item.id,
			render: (item: (typeof items)[number]) => <span data-list-test-item={item.id}>{item.id}</span>,
			columns: { count: 2 },
			overscan: 0
		};
		const mounted = render(<List.VirtualizedContent items={items} {...props} />);
		const viewport = screen.getByRole("region");
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		mounted.rerender(<List.VirtualizedContent items={[{ id: "prepended", group: "first" }, ...items]} {...props} />);
		expect(viewport.scrollTop).toBe(1237);
		expect(
			screen
				.getAllByRole("listitem")
				.slice(0, 2)
				.map((entry) => entry.textContent)
		).toEqual(["item-19", "item-20"]);
	});

	it("удаление anchor выбирает ближайший исходный item, а resetKey возвращает начало без замены viewport", () => {
		const items = createItems(80);
		const props = {
			getKey: (item: (typeof items)[number]) => item.id,
			render: (item: (typeof items)[number]) => <span data-list-test-item={item.id}>{item.id}</span>,
			columns: { count: 2 },
			overscan: 0
		};
		const mounted = render(<List.VirtualizedContent items={items} {...props} resetKey="first" />);
		const viewport = screen.getByRole("region");
		fireEvent.scroll(viewport, { target: { scrollTop: 1237 } });
		const reduced = items.filter((item) => item.id !== "item-20");
		mounted.rerender(<List.VirtualizedContent items={reduced} {...props} resetKey="first" />);
		expect(viewport.scrollTop).toBe(1237);
		expect(
			screen
				.getAllByRole("listitem")
				.slice(0, 2)
				.map((entry) => entry.textContent)
		).toEqual(["item-21", "item-22"]);
		mounted.rerender(<List.VirtualizedContent items={reduced} {...props} resetKey="second" />);
		expect(screen.getByRole("region")).toBe(viewport);
		expect(viewport.scrollTop).toBe(0);
		expect(
			screen
				.getAllByRole("listitem")
				.slice(0, 2)
				.map((entry) => entry.textContent)
		).toEqual(["item-0", "item-1"]);
	});

	it("pagination достигает конца сгруппированных строк, а не исходного числа items", async () => {
		const items = createItems(8);
		let finishPage: () => void = () => undefined;
		const fetchNextPage = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					finishPage = resolve;
				})
		);
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.id}</span>}
				columns={{ count: 2 }}
				grouping={{ getKey: (item) => item.group, render: (key) => <h3 data-list-test-item={`heading-${key}`}>{key}</h3> }}
				overscan={0}
				hasNextPage
				fetchNextPage={fetchNextPage}
			/>
		);
		expect(fetchNextPage).not.toHaveBeenCalled();
		await act(async () => fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 480 } }));
		expect(fetchNextPage).toHaveBeenCalledOnce();
		await act(async () => finishPage());
	});

	it("append в неполную последнюю строку позволяет догрузить следующую страницу при прежнем числе строк", async () => {
		const items = createItems(6);
		const resolvers: (() => void)[] = [];
		const fetchNextPage = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolvers.push(resolve);
				})
		);
		const props = {
			getKey: (item: (typeof items)[number]) => item.id,
			render: (item: (typeof items)[number]) => <span data-list-test-item={item.id}>{item.id}</span>,
			columns: { count: 2 },
			overscan: 0,
			hasNextPage: true,
			fetchNextPage
		};
		const mounted = render(<List.VirtualizedContent items={items.slice(0, 5)} {...props} />);
		expect(fetchNextPage).not.toHaveBeenCalled();
		await act(async () => fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 120 } }));
		expect(fetchNextPage).toHaveBeenCalledOnce();
		await act(async () => resolvers[0]?.());
		await act(async () => mounted.rerender(<List.VirtualizedContent items={items} {...props} />));
		expect(fetchNextPage).toHaveBeenCalledTimes(2);
		await act(async () => resolvers[1]?.());
	});
});
