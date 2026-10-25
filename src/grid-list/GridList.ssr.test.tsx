// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GridList } from "./index";

describe("GridList: серверный контракт", () => {
	it("рендерит доступный viewport и стабильный spacer без DOM и публикации видимости", () => {
		const onVisibleKeysChange = vi.fn();
		const items = Array.from({ length: 30 }, (_, index) => ({ id: String(index) }));
		const html = renderToStaticMarkup(
			<GridList>
				<GridList.Toolbar>
					<button type="button" data-grid-action="filter" />
				</GridList.Toolbar>
				<GridList.Content
					items={items}
					getKey={(item) => item.id}
					render={(item) => <span data-grid-test-item={item.id} />}
					minItemWidth="var(--ui-width-xl)"
					maxColumns={4}
					onVisibleKeysChange={onVisibleKeysChange}
				/>
				<GridList.Footer />
			</GridList>
		);
		// Это точечный SSR/accessibility contract, а не snapshot всего HTML.
		expect(html).toContain('role="region"');
		expect(html).toContain('tabindex="0"');
		expect(html).toContain("<ul");
		expect(html).not.toContain("data-grid-test-item");
		expect(onVisibleKeysChange).not.toHaveBeenCalled();
	});
});
