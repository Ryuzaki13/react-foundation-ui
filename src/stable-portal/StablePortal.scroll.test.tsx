import { StrictMode } from "react";

import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createStablePortalScrollTracking } from "./model/createStablePortalScrollTracking";
import { StablePortal } from "./StablePortal";
import { installStablePortalScrollGeometry } from "./test-fixtures/installStablePortalScrollGeometry";

describe("StablePortal: event-time scroll snapshot", () => {
	it.each(["hidden", "removed", "clipped"])("восстанавливает offsets, если исходный host %s до transfer", (sourceState) => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const children = <div data-testid="scroll" />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const scroll = view.getByTestId("scroll");
		const geometry = installStablePortalScrollGeometry(scroll);
		scroll.scrollTop = 77;
		scroll.scrollLeft = 12;
		fireEvent.scroll(scroll, { bubbles: false });
		if (sourceState === "hidden") first.hidden = true;
		else if (sourceState === "clipped") first.setAttribute("data-test-clipped", "");
		else first.remove();
		geometry.resetNativeOffsets();
		fireEvent.scroll(scroll, { bubbles: false });
		expect(scroll.scrollTop).toBe(0);
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect(view.getByTestId("scroll")).toBe(scroll);
		expect([scroll.scrollTop, scroll.scrollLeft]).toEqual([77, 12]);
		view.unmount();
		first.remove();
		second.remove();
	});

	it("принимает явный scroll к нулю в видимой области", () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const children = <div data-testid="scroll" />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const scroll = view.getByTestId("scroll");
		const geometry = installStablePortalScrollGeometry(scroll);
		scroll.scrollTop = 77;
		scroll.scrollLeft = 12;
		fireEvent.scroll(scroll);
		scroll.scrollTop = 0;
		scroll.scrollLeft = 0;
		fireEvent.scroll(scroll);
		first.hidden = true;
		geometry.resetNativeOffsets();
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect([scroll.scrollTop, scroll.scrollLeft]).toEqual([0, 0]);
		view.unmount();
		first.remove();
		second.remove();
	});

	it("сохраняет event snapshot через parking и промежуточный null target в StrictMode", () => {
		const host = document.body.appendChild(document.createElement("section"));
		const children = <div data-testid="scroll" />;
		const view = render(
			<StrictMode>
				<StablePortal target={host}>{children}</StablePortal>
			</StrictMode>
		);
		const scroll = view.getByTestId("scroll");
		installStablePortalScrollGeometry(scroll);
		scroll.scrollTop = 77;
		scroll.scrollLeft = 12;
		fireEvent.scroll(scroll);
		view.rerender(
			<StrictMode>
				<StablePortal target={null}>{children}</StablePortal>
			</StrictMode>
		);
		expect(scroll.scrollTop).toBe(0);
		fireEvent.scroll(scroll);
		view.rerender(
			<StrictMode>
				<StablePortal target={host}>{children}</StablePortal>
			</StrictMode>
		);
		expect([scroll.scrollTop, scroll.scrollLeft]).toEqual([77, 12]);
		view.unmount();
		host.remove();
	});

	it("не заменяет snapshots вложенных областей нулями временно обрезанного target", () => {
		const first = document.body.appendChild(document.createElement("section"));
		const clipped = document.body.appendChild(document.createElement("section"));
		clipped.setAttribute("data-test-no-scroll-range", "");
		const last = document.body.appendChild(document.createElement("section"));
		const children = (
			<div data-testid="outer-scroll">
				<div data-testid="inner-scroll" />
			</div>
		);
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const outer = view.getByTestId("outer-scroll");
		const inner = view.getByTestId("inner-scroll");
		installStablePortalScrollGeometry(outer);
		installStablePortalScrollGeometry(inner);
		outer.scrollTop = 77;
		outer.scrollLeft = 12;
		inner.scrollTop = 150;
		inner.scrollLeft = 25;
		fireEvent.scroll(outer);
		fireEvent.scroll(inner);
		view.rerender(<StablePortal target={clipped}>{children}</StablePortal>);
		expect([outer.scrollTop, inner.scrollTop]).toEqual([0, 0]);
		fireEvent.scroll(outer);
		fireEvent.scroll(inner);
		view.rerender(<StablePortal target={last}>{children}</StablePortal>);
		expect([outer.scrollTop, outer.scrollLeft]).toEqual([77, 12]);
		expect([inner.scrollTop, inner.scrollLeft]).toEqual([150, 25]);
		view.unmount();
		first.remove();
		clipped.remove();
		last.remove();
	});

	it("снимает programmatic initial offsets только при transfer", () => {
		const first = document.body.appendChild(document.createElement("section"));
		const second = document.body.appendChild(document.createElement("section"));
		const children = <div data-testid="scroll" />;
		const view = render(<StablePortal target={first}>{children}</StablePortal>);
		const scroll = view.getByTestId("scroll");
		installStablePortalScrollGeometry(scroll);
		scroll.scrollTop = 77;
		scroll.scrollLeft = 12;
		// Без scroll event ещё доступный source сохраняет прежний transfer-контракт.
		view.rerender(<StablePortal target={second}>{children}</StablePortal>);
		expect([scroll.scrollTop, scroll.scrollLeft]).toEqual([77, 12]);
		view.unmount();
		first.remove();
		second.remove();
	});

	it("не сканирует subtree на scroll и text removal; удалённые области больше не восстанавливает", async () => {
		const container = document.body.appendChild(document.createElement("section"));
		const scroll = container.appendChild(document.createElement("div"));
		const other = container.appendChild(document.createElement("div"));
		const text = other.appendChild(document.createTextNode("Редактируемый текст"));
		installStablePortalScrollGeometry(scroll);
		installStablePortalScrollGeometry(other);
		const tracking = createStablePortalScrollTracking(container);
		const disconnect = tracking.connect();
		const scan = vi.spyOn(container, "querySelectorAll");
		const contains = vi.spyOn(container, "contains");
		const otherPosition = vi.spyOn(other, "scrollTop", "get");
		scroll.scrollTop = 77;
		fireEvent.scroll(scroll);
		scroll.scrollTop = 100;
		fireEvent.scroll(scroll);
		contains.mockClear();
		other.removeChild(text);
		await act(async () => undefined);
		expect(scan).not.toHaveBeenCalled();
		expect(contains).not.toHaveBeenCalled();
		expect(otherPosition).not.toHaveBeenCalled();
		const scrollPosition = vi.spyOn(scroll, "scrollTop", "set");
		scroll.remove();
		await act(async () => undefined);
		tracking.restore();
		expect(scrollPosition).not.toHaveBeenCalled();
		disconnect();
		container.remove();
	});

	it("cleanup снимает capture listener и очищает snapshot при повторном connect", () => {
		const container = document.body.appendChild(document.createElement("section"));
		const scroll = container.appendChild(document.createElement("div"));
		installStablePortalScrollGeometry(scroll);
		const add = vi.spyOn(container, "addEventListener");
		const remove = vi.spyOn(container, "removeEventListener");
		const tracking = createStablePortalScrollTracking(container);
		const stop = tracking.connect();
		scroll.scrollTop = 77;
		fireEvent.scroll(scroll);
		stop();
		expect(add).toHaveBeenCalledWith("scroll", expect.any(Function), { capture: true, passive: true });
		expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
		scroll.scrollTop = 10;
		fireEvent.scroll(scroll);
		const stopAgain = tracking.connect();
		scroll.scrollTop = 0;
		tracking.restore();
		expect(scroll.scrollTop).toBe(0);
		stopAgain();
		container.remove();
	});
});
