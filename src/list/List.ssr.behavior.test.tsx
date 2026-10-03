// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { List } from "./index";

describe("List: SSR-safe published compound contract", () => {
	it("сохраняет Toolbar/Content/Footer/VirtualizedContent и SSR region/list без browser API", () => {
		const html = renderToStaticMarkup(
			<List>
				<List.Toolbar>
					<button type="button" data-list-action="filter" />
				</List.Toolbar>
				<List.VirtualizedContent
					items={[{ id: "one" }]}
					getKey={(item) => item.id}
					render={(item) => <span data-list-test-item={item.id} />}
					aria-label="server-source"
				/>
				<List.Footer>
					<span data-list-footer />
				</List.Footer>
			</List>
		);
		expect(html).toContain('role="region"');
		expect(html).toContain('aria-label="server-source"');
		expect(html).toContain("<ul");
		expect(html).toContain('data-list-action="filter"');
		expect(html).toContain("data-list-footer");
		expect(typeof List.Content).toBe("function");
	});
});
