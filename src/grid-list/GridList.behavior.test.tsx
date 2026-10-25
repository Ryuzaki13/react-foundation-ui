import { StrictMode } from "react";

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

describe("GridList: непрерывная виртуализированная коллекция", () => {
	it("упаковывает весь набор заново при 4→3→2 колонках без неполных промежуточных рядов", () => {
		const items = createGridListTestItems(12);
		environment.setViewportHeight(1000);
		environment.setLayout(4);
		render(<GridList.Content items={items} getKey={getKey} render={renderItem} minItemWidth="16rem" overscan={0} />);
		for (const columns of [4, 3, 2]) {
			act(() => {
				environment.setLayout(columns);
				environment.flushResizeObservers();
			});
			const cells = screen.getAllByRole("listitem");
			expect(cells).toHaveLength(items.length);
			// Расположение рядов здесь является самим регрессионным contract:
			// не должно быть хвоста прежней четырёхколоночной упаковки.
			const rowCounts = new Map<string, number>();
			for (const cell of cells) rowCounts.set(cell.style.gridRow, (rowCounts.get(cell.style.gridRow) ?? 0) + 1);
			expect([...rowCounts.values()]).toEqual(Array.from({ length: items.length / columns }, () => columns));
			expect(cells.map((cell) => cell.getAttribute("aria-posinset"))).toEqual(items.map((_, index) => String(index + 1)));
			expect(cells.every((cell) => cell.getAttribute("aria-setsize") === String(items.length))).toBe(true);
		}
	});

	it("сохраняет редактируемую карточку и фокус при переносе в другой ряд", () => {
		environment.setViewportHeight(1000);
		const items = createGridListTestItems(12);
		render(
			<GridList.Content
				items={items}
				getKey={getKey}
				render={(item) => <input data-grid-test-item={item.id} defaultValue={item.id} />}
				minItemWidth="16rem"
			/>
		);
		const input = document.querySelector<HTMLInputElement>('[data-grid-test-item="item-2"]');
		const lastInput = document.querySelector<HTMLInputElement>('[data-grid-test-item="item-11"]');
		expect(input).not.toBeNull();
		expect(lastInput).not.toBeNull();
		if (input === null) return;
		fireEvent.change(input, { target: { value: "локальный черновик" } });
		input.focus();
		act(() => {
			environment.setLayout(2);
			environment.flushResizeObservers();
		});
		expect(document.querySelector('[data-grid-test-item="item-2"]')).toBe(input);
		expect(document.querySelector('[data-grid-test-item="item-11"]')).toBe(lastInput);
		expect(input.value).toBe("локальный черновик");
		expect(document.activeElement).toBe(input);
	});

	it("ограничивает число колонок maxColumns, сохраняя одну семантическую запись на карточку", () => {
		environment.setLayout(6);
		environment.setViewportHeight(1000);
		const items = createGridListTestItems(8);
		render(<GridList.Content items={items} getKey={getKey} render={renderItem} minItemWidth="16rem" maxColumns={2} overscan={0} />);
		const cells = screen.getAllByRole("listitem");
		expect(cells).toHaveLength(items.length);
		expect(new Set(cells.map((cell) => cell.style.gridColumn))).toEqual(new Set(["1", "2"]));
	});

	it("ограничивает DOM окном и сообщает исходные ключи только пересекающих viewport рядов", () => {
		const items = createGridListTestItems(5000);
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		render(
			<GridList.Content
				items={items}
				getKey={getKey}
				render={renderItem}
				minItemWidth="16rem"
				overscan={2}
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		expect(screen.getAllByRole("listitem").length).toBeLessThan(30);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(0, 6).map(getKey));
		fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 1200 } });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(30, 36).map(getKey));
		expect(screen.getAllByRole("listitem").length).toBeLessThan(30);
	});

	it("высота ряда следует за самой высокой карточкой и её поздним изменением", () => {
		const items = createGridListTestItems(12);
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		environment.setItemHeight("item-1", 300);
		render(
			<GridList.Content
				items={items}
				getKey={getKey}
				render={renderItem}
				minItemWidth="16rem"
				overscan={0}
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(0, 3).map(getKey));
		act(() => {
			environment.setItemHeight("item-1", 120);
			environment.flushResizeObservers();
		});
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(0, 6).map(getKey));
	});

	it("заголовки групп и sentinel не становятся записями или ключами видимости", () => {
		const items = createGridListTestItems(6);
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		render(
			<GridList.Content
				items={items}
				getKey={getKey}
				render={renderItem}
				minItemWidth="16rem"
				grouping={{ getKey: (item) => item.group, render: (key) => <h3 data-grid-test-group={key} /> }}
				overscan={0}
				hasNextPage
				fetchNextPage={async () => undefined}
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(["item-0", "item-2", "item-4"]);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(screen.getAllByRole("heading")).toHaveLength(1);
		fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 480 } });
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		expect(screen.queryAllByRole("listitem")).toHaveLength(0);
	});

	it("сохраняет логическую запись при глубоком resize, а resetKey возвращает начало того же viewport", () => {
		const items = createGridListTestItems(300);
		const props = { getKey, render: renderItem, minItemWidth: "16rem", overscan: 0 };
		const view = render(<GridList.Content items={items} {...props} resetKey="all" />);
		const viewport = screen.getByRole("region");
		fireEvent.scroll(viewport, { target: { scrollTop: 1217 } });
		act(() => {
			environment.setLayout(2);
			environment.flushResizeObservers();
		});
		expect(viewport.querySelector('[data-grid-test-item="item-30"]')).not.toBeNull();
		expect(viewport.scrollTop).toBeGreaterThan(1217);
		view.rerender(<GridList.Content items={items.slice(20)} {...props} resetKey="filtered" />);
		expect(screen.getByRole("region")).toBe(viewport);
		expect(viewport.scrollTop).toBe(0);
		expect(viewport.querySelector('[data-grid-test-item="item-20"]')).not.toBeNull();
	});

	it("пустое и первичное загрузочное состояния не подменяют уже загруженные карточки", () => {
		const empty = <span data-grid-test-empty />;
		const view = render(<GridList.Content items={[]} getKey={getKey} render={renderItem} minItemWidth="16rem" emptyContent={empty} />);
		expect(view.container.querySelector("[data-grid-test-empty]")).not.toBeNull();
		view.rerender(
			<GridList.Content items={[]} getKey={getKey} render={renderItem} minItemWidth="16rem" emptyContent={empty} isLoading />
		);
		expect(view.container.querySelector("[data-grid-test-empty]")).toBeNull();
		expect(screen.queryAllByRole("listitem")).toHaveLength(0);
		view.rerender(
			<GridList.Content items={createGridListTestItems(3)} getKey={getKey} render={renderItem} minItemWidth="16rem" isLoading />
		);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
	});

	it("освобождает наблюдателей и видимые интересы при размонтировании", () => {
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		const view = render(
			<GridList.Content
				items={createGridListTestItems(30)}
				getKey={getKey}
				render={renderItem}
				minItemWidth="16rem"
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		expect(environment.activeObservedTargets()).toBeGreaterThan(0);
		view.unmount();
		expect(environment.activeObservedTargets()).toBe(0);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
	});

	it("повторный lifecycle StrictMode сохраняет рабочие подписки и полностью очищает их", () => {
		const items = createGridListTestItems(90);
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		const view = render(
			<StrictMode>
				<GridList.Content
					items={items}
					getKey={getKey}
					render={renderItem}
					minItemWidth="16rem"
					overscan={0}
					onVisibleKeysChange={onVisibleKeysChange}
				/>
			</StrictMode>
		);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(0, 6).map(getKey));
		act(() => {
			environment.setLayout(2);
			environment.flushResizeObservers();
		});
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(0, 4).map(getKey));
		act(() => {
			environment.setLayout(1);
			environment.deliverResizeObservers();
		});
		const queuedFrames = environment.pendingAnimationFrames();
		expect(queuedFrames).toBeGreaterThan(0);
		view.unmount();
		expect(environment.activeObservedTargets()).toBe(0);
		// Layout store отменяет свой кадр. Уже поставленные кадры внутреннего
		// ResizeObserver TanStack могут завершиться, но не возвращать подписки/интересы.
		expect(environment.pendingAnimationFrames()).toBeLessThan(queuedFrames);
		expect(onVisibleKeysChange).toHaveBeenLastCalledWith([]);
		const callCount = onVisibleKeysChange.mock.calls.length;
		act(() => {
			environment.flushAnimationFrames();
			environment.flushResizeObservers();
		});
		expect(environment.pendingAnimationFrames()).toBe(0);
		expect(onVisibleKeysChange).toHaveBeenCalledTimes(callCount);
	});
});
