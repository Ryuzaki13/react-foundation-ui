// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdvancedSearchSelect } from "./AdvancedSearchSelect";

import type { SearchConfig } from "../model";

type ClientRow = {
	id: string;
	name: string;
};

const mocks = vi.hoisted(() => ({
	useAdvancedSearch: vi.fn(),
	useAdvancedSearchInitialSelected: vi.fn(),
	useODataTableColumns: vi.fn()
}));

vi.mock("@ryuzaki13/react-foundation-api/odata", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@ryuzaki13/react-foundation-api/odata")>();

	return {
		...actual,
		useODataTableColumns: mocks.useODataTableColumns
	};
});

vi.mock("../model", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../model")>();

	return {
		...actual,
		useAdvancedSearch: mocks.useAdvancedSearch,
		useAdvancedSearchInitialSelected: mocks.useAdvancedSearchInitialSelected
	};
});

vi.mock("./AdvancedSearchSelectUI", () => {
	const AdvancedSearchSelectUI = ({ onOpen }: { onOpen: () => void }) => (
		<button type="button" onClick={onOpen}>
			Открыть расширенный поиск
		</button>
	);

	return { AdvancedSearchSelectUI };
});

const client = {
	id: "client-1",
	name: "Клиент 1"
} satisfies ClientRow;

const secondClient = {
	id: "client-2",
	name: "Клиент 2"
} satisfies ClientRow;

const config = {
	title: "Поиск клиентов",
	odata: {
		service: "CLIENT_SERVICE",
		target: "Clients"
	},
	leadingKey: "id",
	leadingText: "name",
	searchKeys: ["id", "name"],
	columns: [
		{ key: "id", label: "Код" },
		{ key: "name", label: "Наименование" }
	]
} satisfies SearchConfig<ClientRow>;

class IntersectionObserverMock implements IntersectionObserver {
	readonly root = null;
	readonly rootMargin = "0px";
	readonly thresholds = [0];

	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
}

describe("AdvancedSearchModal", () => {
	beforeEach(() => {
		vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
		vi.stubGlobal("scrollTo", vi.fn());

		mocks.useODataTableColumns.mockImplementation(({ columns }) => ({
			columns,
			isLoading: false
		}));
		mocks.useAdvancedSearch.mockReturnValue({
			query: {
				hasNextPage: false,
				isFetchingNextPage: false,
				fetchNextPage: vi.fn(),
				isLoading: false,
				isFetching: false
			},
			items: [client, secondClient],
			searchTerm: "",
			setSearch: vi.fn(),
			clearSearch: vi.fn(),
			filters: {},
			setFilters: vi.fn()
		});
		mocks.useAdvancedSearchInitialSelected.mockReturnValue({
			data: undefined,
			isError: false
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("сохраняет выбор строки при пустом исходном значении", async () => {
		render(<AdvancedSearchSelect config={config} value={[]} onChange={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: "Открыть расширенный поиск" }));

		const row = screen.getByText(client.name).closest("tr");
		expect(row).not.toBeNull();

		fireEvent.click(row!);

		await waitFor(() => {
			expect(row?.getAttribute("aria-selected")).toBe("true");
			expect(screen.getByRole("button", { name: "Удалить бейдж" })).toBeTruthy();
		});
	});

	it("показывает только loading boundary до загрузки исходного выбора", async () => {
		const onChange = vi.fn();
		const view = render(<AdvancedSearchSelect config={config} value={[client.id]} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button", { name: "Открыть расширенный поиск" }));

		expect(screen.getByText("Загружаем выбранные элементы...")).toBeTruthy();
		expect(screen.queryByText(client.name)).toBeNull();

		mocks.useAdvancedSearchInitialSelected.mockReturnValue({
			data: [client],
			isError: false
		});
		view.rerender(<AdvancedSearchSelect config={config} value={[client.id]} onChange={onChange} />);

		const row = await screen.findByText(client.id).then((element) => element.closest("tr"));
		expect(row?.getAttribute("aria-selected")).toBe("true");
		expect(screen.getByRole("button", { name: "Удалить бейдж" })).toBeTruthy();
	});

	it("не сбрасывает modal draft при новом Query snapshot с теми же ключами", async () => {
		mocks.useAdvancedSearchInitialSelected.mockReturnValue({
			data: [client],
			isError: false
		});

		const onChange = vi.fn();
		const view = render(<AdvancedSearchSelect config={config} value={[client.id]} onChange={onChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Открыть расширенный поиск" }));

		const secondRow = screen.getByText(secondClient.name).closest("tr");
		expect(secondRow).not.toBeNull();
		fireEvent.click(secondRow!);

		await waitFor(() => {
			expect(secondRow?.getAttribute("aria-selected")).toBe("true");
			expect(screen.getAllByRole("button", { name: "Удалить бейдж" })).toHaveLength(2);
		});

		mocks.useAdvancedSearchInitialSelected.mockReturnValue({
			data: [{ ...client }],
			isError: false
		});
		view.rerender(<AdvancedSearchSelect config={config} value={[client.id]} onChange={onChange} />);

		expect(secondRow?.getAttribute("aria-selected")).toBe("true");
		expect(screen.getAllByRole("button", { name: "Удалить бейдж" })).toHaveLength(2);
	});
});
