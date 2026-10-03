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

describe("List.VirtualizedContent: совместимый pagination contract", () => {
	it("legacy boolean+fetch вызывается только у конца и не дублируется пока promise выполняется", async () => {
		const items = createListTestItems(40);
		let releasePage: () => void = () => undefined;
		const page = new Promise<void>((resolve) => {
			releasePage = resolve;
		});
		const fetchNextPage = vi.fn(() => page);
		const hasNextPage: boolean = true;
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.label}</span>}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
				aria-label="paged-source"
			/>
		);
		const viewport = screen.getByRole("region", { name: "paged-source" });
		expect(fetchNextPage).not.toHaveBeenCalled();
		await act(async () => fireEvent.scroll(viewport, { target: { scrollTop: 4560 } }));
		expect(fetchNextPage).toHaveBeenCalledOnce();
		fireEvent.scroll(viewport, { target: { scrollTop: 4561 } });
		act(environment.flushResizeObservers);
		expect(fetchNextPage).toHaveBeenCalledOnce();
		await act(async () => releasePage());
	});

	it("hasNextPage=false сохраняет прежний fetch prop, но не вызывает его и не создаёт лишнюю строку", () => {
		const items = createListTestItems(3);
		const fetchNextPage = vi.fn(async () => undefined);
		render(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-test-item={item.id}>{item.label}</span>}
				hasNextPage={false}
				fetchNextPage={fetchNextPage}
				aria-label="complete-source"
			/>
		);
		const viewport = screen.getByRole("region", { name: "complete-source" });
		expect(viewport.querySelectorAll("[data-list-test-item]")).toHaveLength(3);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(fetchNextPage).not.toHaveBeenCalled();
	});
});
