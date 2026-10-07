import { StrictMode } from "react";

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { moveStablePortalContainer } from "./lib/moveStablePortalContainer";
import { StablePortal } from "./StablePortal";
import { StablePortalStateProbe } from "./test-fixtures/StablePortalStateProbe";

describe("StablePortal", () => {
	it("сохраняет один subtree, draft, scroll, focus и subscription при переносах и parking", async () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const subscribe = vi.fn();
		const unsubscribe = vi.fn();
		const children = <StablePortalStateProbe onSubscribe={subscribe} onUnsubscribe={unsubscribe} />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const input = view.getByTestId("draft");
		if (!(input instanceof HTMLInputElement)) throw new Error("Ожидалось поле черновика");
		const scroll = view.getByTestId("scroll");
		const increment = view.getByTestId("increment");
		fireEvent.click(increment);
		fireEvent.change(input, { target: { value: "Сохранённый черновик" } });
		scroll.scrollTop = 77;
		scroll.scrollLeft = 12;
		act(() => {
			input.focus();
			input.setSelectionRange(2, 7, "backward");
		});
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect(second.contains(input)).toBe(true);
		expect(view.getByTestId("draft")).toBe(input);
		expect(input.value).toBe("Сохранённый черновик");
		expect(increment.textContent).toBe("1");
		expect(scroll.scrollTop).toBe(77);
		expect(scroll.scrollLeft).toBe(12);
		expect(document.activeElement).toBe(input);
		expect([input.selectionStart, input.selectionEnd, input.selectionDirection]).toEqual([2, 7, "backward"]);
		view.rerender(<StablePortal target={null}>{children}</StablePortal>);
		const parking = input.parentElement;
		expect(parking?.hidden).toBe(true);
		expect(parking?.inert).toBe(true);
		expect(parking?.style.display).toBe("none");
		expect(document.activeElement).not.toBe(input);
		view.rerender(<StablePortal target={first}>{children}</StablePortal>);
		expect(first.contains(input)).toBe(true);
		expect(document.activeElement).toBe(input);
		expect(parking?.hidden).toBe(false);
		expect(parking?.inert).toBe(false);
		expect(subscribe).toHaveBeenCalledOnce();
		expect(unsubscribe).not.toHaveBeenCalled();
		view.unmount();
		await waitFor(() => expect(document.querySelector("[data-stable-portal]")).toBeNull());
		expect(unsubscribe).toHaveBeenCalledOnce();
		first.remove();
		second.remove();
	});

	it("сохраняет contentEditable selection по boundary nodes, а не живому Range", () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const children = <StablePortalStateProbe onSubscribe={() => undefined} onUnsubscribe={() => undefined} />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const editable = view.getByTestId("editable");
		const text = editable.firstChild;
		if (text === null) throw new Error("Ожидался текст редактора");
		const selection = document.getSelection();
		const range = document.createRange();
		range.setStart(text, 2);
		range.setEnd(text, 6);
		act(() => {
			editable.focus();
			selection?.removeAllRanges();
			selection?.addRange(range);
		});
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect(document.activeElement).toBe(editable);
		expect(selection?.anchorNode).toBe(text);
		expect(selection?.anchorOffset).toBe(2);
		expect(selection?.focusOffset).toBe(6);
		act(() => selection?.setBaseAndExtent(text, 8, text, 1));
		view.rerender(<StablePortal target={first}>{children}</StablePortal>);
		expect(selection?.anchorOffset).toBe(8);
		expect(selection?.focusOffset).toBe(1);
		view.unmount();
		first.remove();
		second.remove();
	});

	it("не крадёт фокус другого control после parking и не пересоздаёт вложенный portal", () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const nested = document.body.appendChild(document.createElement("aside"));
		const outside = document.body.appendChild(document.createElement("button"));
		const subscribe = vi.fn();
		const unsubscribe = vi.fn();
		const children = <StablePortalStateProbe onSubscribe={subscribe} onUnsubscribe={unsubscribe} nestedTarget={nested} />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const input = view.getByTestId("draft");
		const nestedAction = view.getByTestId("nested-action");
		act(() => input.focus());
		view.rerender(<StablePortal target={null}>{children}</StablePortal>);
		act(() => outside.focus());
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect(document.activeElement).toBe(outside);
		expect(view.getByTestId("nested-action")).toBe(nestedAction);
		act(() => nestedAction.focus());
		view.rerender(<StablePortal target={first}>{children}</StablePortal>);
		expect(document.activeElement).toBe(nestedAction);
		expect(subscribe).toHaveBeenCalledOnce();
		view.unmount();
		first.remove();
		second.remove();
		nested.remove();
		outside.remove();
	});

	it("переносит subtree после удаления прежнего host без потери focus и caret", () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const subscribe = vi.fn();
		const unsubscribe = vi.fn();
		const children = <StablePortalStateProbe onSubscribe={subscribe} onUnsubscribe={unsubscribe} />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const input = view.getByTestId("draft");
		if (!(input instanceof HTMLInputElement)) throw new Error("Ожидалось поле черновика");
		act(() => {
			input.focus();
			input.setSelectionRange(1, 5);
		});
		fireEvent.select(input);
		first.remove();
		expect(document.activeElement).not.toBe(input);
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect(view.getByTestId("draft")).toBe(input);
		expect(document.activeElement).toBe(input);
		expect([input.selectionStart, input.selectionEnd]).toEqual([1, 5]);
		expect(subscribe).toHaveBeenCalledOnce();
		expect(unsubscribe).not.toHaveBeenCalled();
		view.unmount();
		second.remove();
	});

	it("оставляет React event ancestry у владельца, а не у физического target", () => {
		const target = document.body.appendChild(document.createElement("section"));
		const onClick = vi.fn();
		const view = render(
			<div onClick={onClick}>
				<StablePortal target={target}>
					<button type="button">Действие</button>
				</StablePortal>
			</div>
		);
		fireEvent.click(view.getByRole("button"));
		expect(onClick).toHaveBeenCalledOnce();
		view.unmount();
		target.remove();
	});

	it("StrictMode не добавляет portal roots и не перезапускает effects при смене host", async () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const subscribe = vi.fn();
		const unsubscribe = vi.fn();
		const children = <StablePortalStateProbe onSubscribe={subscribe} onUnsubscribe={unsubscribe} />;
		const view = render(
			<StrictMode>
				<StablePortal target={first}>{children}</StablePortal>
			</StrictMode>
		);
		const initialCalls = subscribe.mock.calls.length;
		const input = view.getByTestId("draft");
		view.rerender(
			<StrictMode>
				<StablePortal target={second}>{children}</StablePortal>
			</StrictMode>
		);
		expect(view.getByTestId("draft")).toBe(input);
		expect(subscribe).toHaveBeenCalledTimes(initialCalls);
		expect(document.querySelectorAll("[data-stable-portal]")).toHaveLength(1);
		view.unmount();
		await act(async () => undefined);
		expect(document.querySelector("[data-stable-portal]")).toBeNull();
		first.remove();
		second.remove();
	});

	it("SSR и initial hydration пустые, после commit subtree появляется без mismatch", async () => {
		const target = document.body.appendChild(document.createElement("section"));
		const rootContainer = document.body.appendChild(document.createElement("div"));
		const element = (
			<StablePortal target={target}>
				<input data-testid="hydrated" defaultValue="draft" />
			</StablePortal>
		);
		rootContainer.innerHTML = renderToString(element);
		expect(rootContainer.innerHTML).toBe("");
		const onRecoverableError = vi.fn();
		const root = hydrateRoot(rootContainer, element, { onRecoverableError });
		await act(async () => undefined);
		expect(target.querySelector("input")?.value).toBe("draft");
		expect(onRecoverableError).not.toHaveBeenCalled();
		await act(async () => root.unmount());
		target.remove();
		rootContainer.remove();
	});

	it("отклоняет другой document, неподключённый target и cycle до переноса", () => {
		const target = document.body.appendChild(document.createElement("section"));
		const container = target.appendChild(document.createElement("div"));
		const inside = container.appendChild(document.createElement("div"));
		const foreign = document.implementation.createHTMLDocument().body;
		expect(() => moveStablePortalContainer(container, foreign, null)).toThrow();
		expect(() => moveStablePortalContainer(container, document.createElement("div"), null)).toThrow();
		expect(() => moveStablePortalContainer(container, container, null)).toThrow();
		expect(() => moveStablePortalContainer(container, inside, null)).toThrow();
		expect(container.parentNode).toBe(target);
		target.remove();
	});
});
