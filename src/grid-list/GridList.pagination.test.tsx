import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createGridListTestItems, type GridListTestItem } from "./test-fixtures/gridListItems.fixture.test";
import { installGridListTestEnvironment } from "./test-fixtures/installGridListTestEnvironment.fixture.test";

import { GridList } from "./index";

let environment: ReturnType<typeof installGridListTestEnvironment>;

beforeEach(() => {
	environment = installGridListTestEnvironment();
});
afterEach(() => {
	environment.restore();
});

const getKey = (item: GridListTestItem) => item.id;
const renderItem = (item: GridListTestItem) => <span data-grid-test-item={item.id} />;

describe("GridList: постраничный источник", () => {
	it("догружает у края один раз, пока запрос выполняется", async () => {
		let releasePage: () => void = () => undefined;
		const page = new Promise<void>((resolve) => {
			releasePage = resolve;
		});
		const fetchNextPage = vi.fn(() => page);
		render(
			<GridList.Content
				items={createGridListTestItems(90)}
				getKey={getKey}
				render={renderItem}
				minItemWidth="16rem"
				overscan={0}
				hasNextPage
				fetchNextPage={fetchNextPage}
			/>
		);
		expect(fetchNextPage).not.toHaveBeenCalled();
		await act(async () => fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 3360 } }));
		expect(fetchNextPage).toHaveBeenCalledOnce();
		await act(async () => {
			fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 3361 } });
			environment.flushResizeObservers();
		});
		expect(fetchNextPage).toHaveBeenCalledOnce();
		await act(async () => releasePage());
	});

	it("добавление в неполный хвост разрешает новую загрузку без увеличения числа рядов", async () => {
		const items = createGridListTestItems(6);
		const resolvers: (() => void)[] = [];
		const fetchNextPage = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolvers.push(resolve);
				})
		);
		const props = { getKey, render: renderItem, minItemWidth: "16rem", overscan: 0, hasNextPage: true, fetchNextPage };
		const view = render(<GridList.Content items={items.slice(0, 5)} {...props} />);
		await act(async () => undefined);
		expect(fetchNextPage).toHaveBeenCalledOnce();
		await act(async () => resolvers[0]?.());
		await act(async () => view.rerender(<GridList.Content items={items} {...props} />));
		expect(fetchNextPage).toHaveBeenCalledTimes(2);
		await act(async () => resolvers[1]?.());
	});

	it("полный набор не создаёт запросов, даже если передан fetch callback", () => {
		const fetchNextPage = vi.fn(async () => undefined);
		render(
			<GridList.Content
				items={createGridListTestItems(3)}
				getKey={getKey}
				render={renderItem}
				minItemWidth="16rem"
				hasNextPage={false}
				fetchNextPage={fetchNextPage}
			/>
		);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(fetchNextPage).not.toHaveBeenCalled();
	});
});
