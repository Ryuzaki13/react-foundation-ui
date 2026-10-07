import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FullscreenPortal } from "./FullscreenPortal";
import { FullscreenStablePortalProbe } from "./test-fixtures/FullscreenStablePortalProbe";

beforeEach(() => {
	vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("FullscreenPortal viewport", () => {
	it("учитывает поздний FloatingPortal mount без второго scroll-lock owner", async () => {
		vi.stubGlobal("visualViewport", Object.assign(new EventTarget(), { width: 390, height: 320, offsetTop: 100, offsetLeft: 0 }));
		const view = render(
			<FullscreenPortal open title="Поверхность" description="Описание" onOpenChange={() => undefined}>
				Содержимое
			</FullscreenPortal>
		);
		const panel = await screen.findByRole("dialog");
		await waitFor(() => expect(panel.parentElement?.style.getPropertyValue("--visual-viewport-height")).toBe("320px"));
		expect(panel.parentElement?.style.getPropertyValue("--visual-viewport-top")).toBe("100px");
		expect(document.body.style.position).toBe("fixed");
		expect(document.body.style.getPropertyValue("--floating-ui-scrollbar-width")).toBe("");
		view.unmount();
		expect(document.body.style.position).toBe("");
		expect(window.scrollTo).toHaveBeenCalledOnce();
	});
});

describe("FullscreenPortal Escape", () => {
	it("сохраняет закрытие по Escape по умолчанию", async () => {
		const onOpenChange = vi.fn();
		render(
			<FullscreenPortal open title="Поверхность" description="Описание" onOpenChange={onOpenChange}>
				<input data-testid="control" />
			</FullscreenPortal>
		);
		const control = await screen.findByTestId("control");
		act(() => control.focus());
		fireEvent.keyDown(control, { key: "Escape" });
		expect(onOpenChange).toHaveBeenCalledOnce();
		expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
	});

	it("escapeKey=false отключает встроенный Escape в панели и документе", async () => {
		const onOpenChange = vi.fn();
		render(
			<FullscreenPortal open title="Поверхность" description="Описание" escapeKey={false} onOpenChange={onOpenChange}>
				<input data-testid="control" />
			</FullscreenPortal>
		);
		const control = await screen.findByTestId("control");
		act(() => control.focus());
		fireEvent.keyDown(control, { key: "Escape" });
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onOpenChange).not.toHaveBeenCalled();
		expect(screen.getByRole("dialog").contains(control)).toBe(true);
		expect(document.body.style.position).toBe("fixed");
	});

	it("изменение escapeKey снимает и восстанавливает обработчик без перемонтирования", async () => {
		const onOpenChange = vi.fn();
		const content = <input data-testid="control" />;
		const view = render(
			<FullscreenPortal open title="Поверхность" description="Описание" onOpenChange={onOpenChange}>
				{content}
			</FullscreenPortal>
		);
		const control = await screen.findByTestId("control");
		view.rerender(
			<FullscreenPortal open title="Поверхность" description="Описание" escapeKey={false} onOpenChange={onOpenChange}>
				{content}
			</FullscreenPortal>
		);
		fireEvent.keyDown(control, { key: "Escape" });
		expect(onOpenChange).not.toHaveBeenCalled();
		view.rerender(
			<FullscreenPortal open title="Поверхность" description="Описание" onOpenChange={onOpenChange}>
				{content}
			</FullscreenPortal>
		);
		expect(screen.getByTestId("control")).toBe(control);
		fireEvent.keyDown(control, { key: "Escape" });
		expect(onOpenChange).toHaveBeenCalledOnce();
	});

	it("вложенный popup закрывает только себя, следующий Escape обрабатывает владелец содержимого", async () => {
		const onOpenChange = vi.fn();
		const onPopupChange = vi.fn();
		const onHostEscape = vi.fn();
		render(<FullscreenStablePortalProbe open onOpenChange={onOpenChange} onPopupChange={onPopupChange} onHostEscape={onHostEscape} />);
		const trigger = await screen.findByTestId("popup-trigger");
		act(() => trigger.focus());
		fireEvent.click(trigger);
		const action = await screen.findByTestId("popup-action");
		act(() => action.focus());
		fireEvent.keyDown(action, { key: "Escape" });
		await waitFor(() => expect(screen.queryByTestId("popup-action")).toBeNull());
		expect(onPopupChange).toHaveBeenLastCalledWith(false);
		expect(onHostEscape).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalled();
		await waitFor(() => expect(document.activeElement).toBe(trigger));
		fireEvent.keyDown(trigger, { key: "Escape" });
		expect(onHostEscape).toHaveBeenCalledOnce();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it("StablePortal сохраняет draft, caret и focus при открытии и закрытии fullscreen", async () => {
		const onOpenChange = vi.fn();
		const view = render(<FullscreenStablePortalProbe open={false} onOpenChange={onOpenChange} />);
		const control = await screen.findByTestId("draft");
		if (!(control instanceof HTMLInputElement)) throw new Error("Ожидалось поле черновика");
		fireEvent.change(control, { target: { value: "Изменённый черновик" } });
		act(() => {
			control.focus();
			control.setSelectionRange(2, 8);
		});
		view.rerender(<FullscreenStablePortalProbe open onOpenChange={onOpenChange} />);
		await waitFor(() => expect(screen.getByTestId("fullscreen-target").contains(control)).toBe(true));
		expect(screen.getByTestId("draft")).toBe(control);
		expect(control.value).toBe("Изменённый черновик");
		await waitFor(() => expect(document.activeElement).toBe(control));
		expect([control.selectionStart, control.selectionEnd]).toEqual([2, 8]);
		view.rerender(<FullscreenStablePortalProbe open={false} onOpenChange={onOpenChange} />);
		await waitFor(() => expect(screen.getByTestId("cell").contains(control)).toBe(true));
		await waitFor(() => expect(document.activeElement).toBe(control));
		expect(screen.getByTestId("draft")).toBe(control);
		expect(control.value).toBe("Изменённый черновик");
		expect([control.selectionStart, control.selectionEnd]).toEqual([2, 8]);
		expect(document.body.style.position).toBe("");
	});
});
