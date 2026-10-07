import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { List } from "./index";

/** Проверяется Grid-slot contract панелей, а не их произвольное оформление consumer. */
describe("List: нейтральные Toolbar/Footer сохраняют собственную строку", () => {
	it("несколько controls в каждой панели не становятся соседними viewport Grid-items", () => {
		const view = render(
			<List>
				<List.Toolbar>
					<button type="button" data-list-action="first-filter" />
					<button type="button" data-list-action="second-filter" />
				</List.Toolbar>
				<List.Content items={["one"]} getKey={(item) => item} render={(item) => <span data-list-test-item={item} />} />
				<List.Footer>
					<button type="button" data-list-action="first-footer" />
					<button type="button" data-list-action="second-footer" />
				</List.Footer>
			</List>
		);
		const layout = view.container.firstElementChild;
		const toolbar = view.container.querySelector('[data-list-action="first-filter"]')?.parentElement;
		const footer = view.container.querySelector('[data-list-action="first-footer"]')?.parentElement;
		expect(layout?.children).toHaveLength(3);
		expect(toolbar).toBe(layout?.firstElementChild);
		expect(footer).toBe(layout?.lastElementChild);
		expect(view.container.querySelector('[data-list-action="second-filter"]')?.parentElement).toBe(toolbar);
		expect(view.container.querySelector('[data-list-action="second-footer"]')?.parentElement).toBe(footer);
		// В 3.24.0 панель не добавляет обязательные классы border/padding/layout.
		expect(toolbar?.getAttribute("class")).toBeNull();
		expect(footer?.getAttribute("class")).toBeNull();
	});

	it("пустые панели сохраняют свои slots при последующем появлении действий", () => {
		const view = render(
			<List>
				<List.Toolbar />
				<List.Content items={[]} getKey={(item: string) => item} render={() => null} />
				<List.Footer>{null}</List.Footer>
			</List>
		);
		const layout = view.container.firstElementChild;
		const toolbar = layout?.firstElementChild;
		const footer = layout?.lastElementChild;
		expect(layout?.children).toHaveLength(3);
		view.rerender(
			<List>
				<List.Toolbar>
					<button type="button" data-list-action="filter" />
				</List.Toolbar>
				<List.Content items={[]} getKey={(item: string) => item} render={() => null} />
				<List.Footer>
					<button type="button" data-list-action="footer" />
				</List.Footer>
			</List>
		);
		expect(layout?.children).toHaveLength(3);
		expect(view.container.querySelector('[data-list-action="filter"]')?.parentElement).toBe(toolbar);
		expect(view.container.querySelector('[data-list-action="footer"]')?.parentElement).toBe(footer);
	});
});
