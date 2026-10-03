import { StrictMode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createListTestItems } from "./test-fixtures/createListTestItems";
import { installListTestEnvironment } from "./test-fixtures/installListTestEnvironment";

import { List } from "./index";

let environment: ReturnType<typeof installListTestEnvironment>;

beforeEach(() => {
	environment = installListTestEnvironment();
});
afterEach(() => {
	environment.restore();
});

describe("List.VirtualizedContent: публичный browser lifecycle", () => {
	it("1733 уже загруженных элемента используют ограниченное окно без фиктивного fetch и допускают последний ключ", () => {
		const items = createListTestItems(1733);
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.label}</span>}
				aria-label="full-source"
			/>
		);
		const viewport = screen.getByRole("region", { name: "full-source" });
		expect(viewport.querySelectorAll("[data-list-test-item]").length).toBeGreaterThan(0);
		expect(viewport.querySelectorAll("[data-list-test-item]").length).toBeLessThan(25);
		expect(viewport.querySelector('[data-list-test-item="item-0"]')).not.toBeNull();
		fireEvent.scroll(viewport, { target: { scrollTop: 1733 * 120 - 240 } });
		expect(viewport.querySelector('[data-list-test-item="item-1732"]')).not.toBeNull();
		expect(viewport.querySelector('[data-list-test-item="item-0"]')).toBeNull();
		expect(viewport.querySelectorAll("[data-list-test-item]").length).toBeLessThan(25);
	});

	it("StrictMode сохраняет scroll subscription, cleanup освобождает observers и больше не вызывает renderer", () => {
		const items = createListTestItems(40);
		const renderItem = vi.fn((item: (typeof items)[number]) => <span data-list-test-item={item.id}>{item.label}</span>);
		const mounted = render(
			<StrictMode>
				<List.VirtualizedContent items={items} getKey={(item) => item.id} render={renderItem} aria-label="strict-source" />
			</StrictMode>
		);
		const viewport = screen.getByRole("region", { name: "strict-source" });
		act(environment.flushResizeObservers);
		expect(environment.activeObservedTargets()).toBeGreaterThan(0);
		fireEvent.scroll(viewport, { target: { scrollTop: 1200 } });
		expect(viewport.querySelector('[data-list-test-item="item-10"]')).not.toBeNull();
		mounted.unmount();
		expect(environment.activeObservedTargets()).toBe(0);
		renderItem.mockClear();
		fireEvent.scroll(viewport, { target: { scrollTop: 2400 } });
		act(environment.flushResizeObservers);
		expect(renderItem).not.toHaveBeenCalled();
	});
});
