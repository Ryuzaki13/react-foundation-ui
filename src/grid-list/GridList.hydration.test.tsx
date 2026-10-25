import { act } from "react";

import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createGridListTestItems } from "./test-fixtures/gridListItems.fixture.test";
import { installGridListTestEnvironment } from "./test-fixtures/installGridListTestEnvironment.fixture.test";

import { GridList } from "./index";

let environment: ReturnType<typeof installGridListTestEnvironment>;

beforeEach(() => {
	environment = installGridListTestEnvironment();
});
afterEach(() => {
	environment.restore();
});

describe("GridList: гидратация", () => {
	it("принимает серверную геометрию и измеряет колонки после commit без mismatch", async () => {
		const onVisibleKeysChange = vi.fn<(keys: readonly string[]) => void>();
		const items = createGridListTestItems(300);
		const content = (
			<GridList.Content
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-grid-test-item={item.id} />}
				minItemWidth="16rem"
				onVisibleKeysChange={onVisibleKeysChange}
			/>
		);
		const host = document.createElement("div");
		host.innerHTML = renderToString(content);
		document.body.append(host);
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
		const onRecoverableError = vi.fn();
		let root: ReturnType<typeof hydrateRoot> | undefined;
		try {
			await act(async () => {
				root = hydrateRoot(host, content, { onRecoverableError });
			});
			expect(onRecoverableError).not.toHaveBeenCalled();
			expect(host.querySelectorAll("[data-grid-test-item]").length).toBeGreaterThan(0);
			expect(host.querySelectorAll("[data-grid-test-item]").length).toBeLessThan(items.length);
			expect(onVisibleKeysChange).toHaveBeenLastCalledWith(items.slice(0, 6).map((item) => item.id));
		} finally {
			await act(async () => root?.unmount());
			host.remove();
		}
	});
});
