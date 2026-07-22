// @vitest-environment jsdom

import { act } from "react";

import { fireEvent, getByRole } from "@testing-library/dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Disclosure } from "./Disclosure";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Disclosure", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	it("рендерит headerActions вне toggle и не меняет open-состояние по его клику", () => {
		const onAction = vi.fn();
		act(() =>
			root.render(
				<Disclosure
					label="Группа"
					headerActions={
						<button type="button" onClick={onAction}>
							Очистить
						</button>
					}>
					Содержимое
				</Disclosure>
			)
		);

		const toggle = getByRole(container, "button", { name: "Группа" });
		const action = getByRole(container, "button", { name: "Очистить" });
		expect(toggle.contains(action)).toBe(false);
		expect(toggle.getAttribute("aria-expanded")).toBe("false");

		act(() => fireEvent.click(action));
		expect(onAction).toHaveBeenCalledOnce();
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(container.querySelector('[role="region"]')).toBeNull();

		act(() => fireEvent.click(toggle));
		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		const region = container.querySelector('[role="region"]');
		expect(region?.textContent).toContain("Содержимое");
		expect(toggle.getAttribute("aria-controls")).toBe(region?.id);
		expect(region?.getAttribute("aria-labelledby")).toBe(toggle.id);
	});
});
