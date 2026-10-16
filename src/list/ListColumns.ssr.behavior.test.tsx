// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { List } from "./index";

describe("List: columns и grouping при SSR", () => {
	const items = [
		{ id: "a-1", group: "a" },
		{ id: "b-1", group: "b" },
		{ id: "a-2", group: "a" }
	];
	const grouping = {
		getKey: (item: (typeof items)[number]) => item.group,
		render: (key: string) => <h3 data-list-group={key}>{key}</h3>
	};

	it("Content строит одинаковый исходный порядок групп и семантику без browser API", () => {
		const html = renderToStaticMarkup(
			<List.Content
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-item={item.id} />}
				columns={{ count: 2, minItemWidth: "12rem" }}
				grouping={grouping}
			/>
		);
		expect(html.indexOf('data-list-item="a-1"')).toBeLessThan(html.indexOf('data-list-item="a-2"'));
		expect(html.indexOf('data-list-item="a-2"')).toBeLessThan(html.indexOf('data-list-item="b-1"'));
		expect(html).toContain('data-list-group="a"');
		expect(html).toContain('data-list-group="b"');
		expect(html).toContain('aria-posinset="3"');
		expect(html).toContain('aria-setsize="3"');
	});

	it("VirtualizedContent рассчитывает строки с группами без DOM и не публикует visible keys", () => {
		const onVisibleKeysChange = vi.fn();
		const html = renderToStaticMarkup(
			<List.VirtualizedContent
				items={items}
				getKey={(item) => item.id}
				render={(item) => <span data-list-item={item.id} />}
				columns={{ count: 2, minItemWidth: "12rem" }}
				grouping={grouping}
				onVisibleKeysChange={onVisibleKeysChange}
				aria-label="server-columns"
			/>
		);
		expect(html).toContain('role="region"');
		expect(html).toContain('aria-label="server-columns"');
		expect(html).toContain("<ul");
		expect(html).toContain("height:480px");
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
	});
});
