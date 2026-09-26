import { Profiler, StrictMode } from "react";

import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FloatingWindow } from "./FloatingWindow";
import { FloatingWindows } from "./FloatingWindows";
import { type FloatingWindowPosition } from "./model/floatingWindowsTypes";
import { getFloatingWindowAction } from "./test-fixtures/getFloatingWindowAction";
import { getFloatingWindowElement } from "./test-fixtures/getFloatingWindowElement";
import { installFloatingWindowsTestEnvironment } from "./test-fixtures/installFloatingWindowsTestEnvironment";

let environment: ReturnType<typeof installFloatingWindowsTestEnvironment>;

beforeEach(() => {
	localStorage.clear();
	environment = installFloatingWindowsTestEnvironment();
});

afterEach(() => {
	cleanup();
	environment.restore();
	localStorage.clear();
});

describe("FloatingWindows", () => {
	it("связывает немодальное окно с заголовком и предоставляет семантические команды", () => {
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Доступное имя окна" onClose={vi.fn()}>
					<input aria-label="Поле внутри окна" />
				</FloatingWindow>
			</FloatingWindows>
		);

		const window = getFloatingWindowElement("a");
		const labelId = window.getAttribute("aria-labelledby");
		expect(window.getAttribute("role")).toBe("dialog");
		expect(window.getAttribute("aria-modal")).not.toBe("true");
		expect(window.tabIndex).toBe(-1);
		expect(labelId).toBeTruthy();
		expect(document.getElementById(labelId ?? "")?.textContent).toBe("Доступное имя окна");
		expect(getFloatingWindowAction(window, "move").tagName).toBe("BUTTON");
		expect(getFloatingWindowAction(window, "close").type).toBe("button");
	});

	it("фиксирует keyboard-перемещение один раз и поддерживает точный шаг с Shift", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");

		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "ArrowDown", shiftKey: true });
		expect(onPositionChange).not.toHaveBeenCalled();
		fireEvent.keyDown(move, { key: "Enter" });

		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 51 });
	});

	it("начинает и подтверждает перемещение через assistive click без pointer/keyboard activation", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");

		fireEvent.click(move, { detail: 0 });
		expect(move.getAttribute("aria-pressed")).toBe("true");
		fireEvent.keyDown(move, { key: "ArrowRight" });
		expect(onPositionChange).not.toHaveBeenCalled();
		fireEvent.click(move, { detail: 0 });
		expect(move.getAttribute("aria-pressed")).toBe("false");
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("не начинает keyboard move после обычного pointer click без перемещения", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");

		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerUp(move, { pointerId: 7, clientX: 100, clientY: 100 });
		fireEvent.click(move, { detail: 1 });
		expect(move.getAttribute("aria-pressed")).toBe("false");
		fireEvent.keyDown(move, { key: "ArrowRight" });
		expect(onPositionChange).not.toHaveBeenCalled();
		fireEvent.click(move, { detail: 0 });
		fireEvent.keyDown(move, { key: "ArrowDown" });
		fireEvent.click(move, { detail: 0 });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 40, y: 60 });
	});

	it("отменяет keyboard-перемещение без callback и без закрытия окна", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const onClose = vi.fn();
		render(
			<FloatingWindows>
				<FloatingWindow
					id="a"
					title="Окно"
					defaultPosition={{ x: 40, y: 50 }}
					onPositionChange={onPositionChange}
					onClose={onClose}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");

		fireEvent.keyDown(move, { key: " " });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Escape" });
		expect(onPositionChange).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();

		fireEvent.keyDown(move, { key: " " });
		fireEvent.keyDown(move, { key: "ArrowDown" });
		fireEvent.keyDown(move, { key: " " });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 40, y: 60 });
	});

	it("перемещает pointer-указателем только за handle и сообщает конечную позицию", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					<input data-testid="content-input" />
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const window = getFloatingWindowElement("a");
		const input = window.querySelector("input");
		if (!input) throw new Error("Не найдено поле окна");
		fireEvent.pointerDown(input, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerMove(input, { pointerId: 7, clientX: 130, clientY: 120 });
		fireEvent.pointerUp(input, { pointerId: 7, clientX: 130, clientY: 120 });
		expect(onPositionChange).not.toHaveBeenCalled();

		const move = getFloatingWindowAction(window, "move");
		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerMove(move, { pointerId: 7, clientX: 130, clientY: 120 });
		expect(onPositionChange).not.toHaveBeenCalled();
		fireEvent.pointerUp(move, { pointerId: 7, clientX: 130, clientY: 120 });

		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 70, y: 70 });
		expect(move.hasPointerCapture(7)).toBe(false);
	});

	it("откатывает pointercancel и игнорирует посторонний pointerId", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");

		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerMove(move, { pointerId: 8, clientX: 300, clientY: 300 });
		fireEvent.pointerMove(move, { pointerId: 7, clientX: 160, clientY: 170 });
		fireEvent.pointerCancel(move, { pointerId: 7 });
		expect(onPositionChange).not.toHaveBeenCalled();

		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("удерживает окно внутри измеренной области после движения за её пределы", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" width={300} height={200} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerMove(move, { pointerId: 7, clientX: 3000, clientY: 3000 });
		fireEvent.pointerUp(move, { pointerId: 7, clientX: 3000, clientY: 3000 });

		expect(onPositionChange).toHaveBeenCalledOnce();
		expect(onPositionChange.mock.calls[0]?.[0]).toEqual({ x: expect.any(Number), y: expect.any(Number) });
		const position = onPositionChange.mock.calls[0]?.[0];
		if (!position) throw new Error("Не получена конечная позиция окна");
		expect(position.x).toBeGreaterThanOrEqual(0);
		expect(position.y).toBeGreaterThanOrEqual(0);
		expect(position.x + 300).toBeLessThanOrEqual(800);
		expect(position.y + 200).toBeLessThanOrEqual(600);
	});

	it("не теряет начальную позицию до первого положительного измерения", () => {
		environment.resizeArea({ width: 0, height: 0 });
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(() => {
			environment.resizeArea({ width: 800, height: 600 });
			environment.flushResizeObservers();
		});
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("не принимает ненулевую рамку за доступную область до раскрытия нулевого client box", () => {
		environment.resizeArea({ width: 0, height: 0 });
		environment.setAreaBorder(1);
		environment.setWindowSize({ width: 300, height: 200 });
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const view = render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const boundary = view.container.querySelector<HTMLElement>("[data-floating-windows]");
		if (!boundary) throw new Error("Не найдена область окон");
		expect(boundary.clientWidth).toBe(0);
		expect(boundary.getBoundingClientRect().width).toBe(2);
		act(() => {
			environment.resizeArea({ width: 800, height: 600 });
			environment.flushResizeObservers();
		});
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("корректирует положение при сужении области до мобильной ширины", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow
					id="a"
					title="Окно"
					width={300}
					height={200}
					defaultPosition={{ x: 450, y: 350 }}
					onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(() => {
			environment.resizeArea({ width: 320, height: 300 });
			environment.flushResizeObservers();
		});
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowLeft" });
		fireEvent.keyDown(move, { key: "ArrowUp" });
		fireEvent.keyDown(move, { key: "Enter" });
		const position = onPositionChange.mock.calls.at(-1)?.[0];
		if (!position) throw new Error("Не получена конечная позиция окна");
		expect(position.x).toBeGreaterThanOrEqual(0);
		expect(position.y).toBeGreaterThanOrEqual(0);
		expect(position.x + 300).toBeLessThanOrEqual(320);
		expect(position.y + 200).toBeLessThanOrEqual(300);
	});

	it("не фиксирует незавершённый drag при закрытии и повторном открытии окна", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const window = (
			<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
				Содержимое
			</FloatingWindow>
		);
		const view = render(<FloatingWindows>{window}</FloatingWindows>);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerMove(move, { pointerId: 7, clientX: 160, clientY: 170 });
		view.rerender(<FloatingWindows>{null}</FloatingWindows>);
		expect(onPositionChange).not.toHaveBeenCalled();
		view.rerender(<FloatingWindows>{window}</FloatingWindows>);
		act(environment.flushResizeObservers);
		const reopenedMove = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(reopenedMove, { key: "Enter" });
		fireEvent.keyDown(reopenedMove, { key: "ArrowRight" });
		fireEvent.keyDown(reopenedMove, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it.each(["blur", "lostpointercapture"] as const)("отменяет движение при %s без потери исходной позиции", (eventType) => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		fireEvent.pointerMove(move, { pointerId: 7, clientX: 160, clientY: 170 });
		if (eventType === "blur") fireEvent.blur(move);
		else fireEvent.lostPointerCapture(move, { pointerId: 7 });
		expect(onPositionChange).not.toHaveBeenCalled();
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("не перерисовывает потребительское содержимое на каждом кадре pointermove", async () => {
		const onContentRender = vi.fn();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно">
					<Profiler id="window-content" onRender={onContentRender}>
						<input />
					</Profiler>
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.pointerDown(move, { button: 0, pointerId: 7, isPrimary: true, clientX: 100, clientY: 100 });
		onContentRender.mockClear();
		for (const delta of [10, 20, 30, 40]) {
			fireEvent.pointerMove(move, { pointerId: 7, clientX: 100 + delta, clientY: 100 + delta });
		}
		await act(async () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
		expect(onContentRender).not.toHaveBeenCalled();
		fireEvent.pointerUp(move, { pointerId: 7, clientX: 140, clientY: 140 });
	});

	it("поднимает окно при фокусе содержимого, включая первое взаимодействие", () => {
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Первое">
					<input />
				</FloatingWindow>
				<FloatingWindow id="b" title="Второе">
					<input />
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const first = getFloatingWindowElement("a");
		const second = getFloatingWindowElement("b");
		const input = first.querySelector("input");
		if (!input) throw new Error("Не найдено поле окна");
		act(() => input.focus());

		expect(document.activeElement).toBe(input);
		expect(Number(first.style.zIndex)).toBeGreaterThan(Number(second.style.zIndex));
	});

	it("позволяет выйти Tab из немодального окна в окружающую страницу", async () => {
		const user = userEvent.setup();
		const view = render(
			<>
				<FloatingWindows>
					<FloatingWindow id="a" title="Окно">
						<input data-testid="last-window-control" />
					</FloatingWindow>
				</FloatingWindows>
				<button type="button" data-testid="outside-control">
					Следующее действие страницы
				</button>
			</>
		);
		act(() => view.getByTestId("last-window-control").focus());
		await user.tab();
		expect(document.activeElement).toBe(view.getByTestId("outside-control"));
	});

	it.each([false, true])("возвращает фокус opener после закрытия активного окна, StrictMode=%s", (reactStrictMode) => {
		const opener = (
			<button type="button" data-testid="opener">
				Открыть окно
			</button>
		);
		const view = render(
			<>
				{opener}
				<FloatingWindows>{null}</FloatingWindows>
			</>,
			{ reactStrictMode }
		);
		act(() => view.getByTestId("opener").focus());
		view.rerender(
			<>
				{opener}
				<FloatingWindows>
					<FloatingWindow id="a" title="Окно">
						<input />
					</FloatingWindow>
				</FloatingWindows>
			</>
		);
		expect(getFloatingWindowElement("a").contains(document.activeElement)).toBe(true);
		view.rerender(
			<>
				{opener}
				<FloatingWindows>{null}</FloatingWindows>
			</>
		);
		expect(document.activeElement).toBe(view.getByTestId("opener"));
	});

	it("не забирает фокус другого окна при удалении неактивного", () => {
		const first = (
			<FloatingWindow key="a" id="a" title="Первое">
				<input />
			</FloatingWindow>
		);
		const second = (
			<FloatingWindow key="b" id="b" title="Второе">
				<input data-testid="remaining-input" />
			</FloatingWindow>
		);
		const view = render(
			<FloatingWindows>
				{first}
				{second}
			</FloatingWindows>
		);
		const input = view.getByTestId("remaining-input");
		act(() => input.focus());
		view.rerender(<FloatingWindows>{second}</FloatingWindows>);
		expect(document.activeElement).toBe(input);
	});

	it("закрывает по Escape только активное окно с фокусом внутри", () => {
		const firstClose = vi.fn();
		const secondClose = vi.fn();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Первое" onClose={firstClose}>
					<input />
				</FloatingWindow>
				<FloatingWindow id="b" title="Второе" onClose={secondClose}>
					<input />
				</FloatingWindow>
			</FloatingWindows>
		);
		const first = getFloatingWindowElement("a");
		const input = first.querySelector("input");
		if (!input) throw new Error("Не найдено поле окна");
		act(() => input.focus());
		fireEvent.keyDown(input, { key: "Escape" });
		expect(firstClose).toHaveBeenCalledOnce();
		expect(secondClose).not.toHaveBeenCalled();
		fireEvent.keyDown(document.body, { key: "Escape" });
		expect(firstClose).toHaveBeenCalledOnce();
		expect(secondClose).not.toHaveBeenCalled();
	});

	it("позволяет вложенному control обработать Escape раньше окна", () => {
		const onClose = vi.fn();
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно" onClose={onClose}>
					<input onKeyDown={(event) => event.key === "Escape" && event.preventDefault()} />
				</FloatingWindow>
			</FloatingWindows>
		);
		const input = getFloatingWindowElement("a").querySelector("input");
		if (!input) throw new Error("Не найдено поле окна");
		act(() => input.focus());
		fireEvent.keyDown(input, { key: "Escape" });
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.click(getFloatingWindowAction(getFloatingWindowElement("a"), "close"));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("изолирует одинаковые ID в разных областях", () => {
		const firstChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const secondChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const first = render(
			<FloatingWindows>
				<FloatingWindow id="same" title="Первое" defaultPosition={{ x: 40, y: 50 }} onPositionChange={firstChange}>
					Первое содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		const second = render(
			<FloatingWindows>
				<FloatingWindow id="same" title="Второе" defaultPosition={{ x: 100, y: 150 }} onPositionChange={secondChange}>
					Второе содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		const firstMove = getFloatingWindowAction(getFloatingWindowElement("same", first.container), "move");
		const secondMove = getFloatingWindowAction(getFloatingWindowElement("same", second.container), "move");
		fireEvent.keyDown(firstMove, { key: "Enter" });
		fireEvent.keyDown(firstMove, { key: "ArrowRight" });
		fireEvent.keyDown(firstMove, { key: "Enter" });
		expect(firstChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
		expect(secondChange).not.toHaveBeenCalled();
		fireEvent.keyDown(secondMove, { key: "Enter" });
		fireEvent.keyDown(secondMove, { key: "ArrowDown" });
		fireEvent.keyDown(secondMove, { key: "Enter" });
		expect(secondChange).toHaveBeenCalledExactlyOnceWith({ x: 100, y: 160 });
	});

	it("сохраняет работоспособность после StrictMode cleanup и смены identity", () => {
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const view = render(
			<StrictMode>
				<FloatingWindows>
					<FloatingWindow id="old" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
						Содержимое
					</FloatingWindow>
				</FloatingWindows>
			</StrictMode>
		);
		act(environment.flushResizeObservers);
		view.rerender(
			<StrictMode>
				<FloatingWindows>
					<FloatingWindow id="new" title="Окно" defaultPosition={{ x: 140, y: 150 }} onPositionChange={onPositionChange}>
						Содержимое
					</FloatingWindow>
				</FloatingWindows>
			</StrictMode>
		);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("new"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 150, y: 150 });
		expect(view.container.querySelector('[data-floating-window-id="old"]')).toBeNull();
	});
});

describe("FloatingWindows storage и hydration", () => {
	it("не обращается к storage без явного storageKey", () => {
		const read = vi.spyOn(Storage.prototype, "getItem");
		const write = vi.spyOn(Storage.prototype, "setItem");
		render(
			<FloatingWindows>
				<FloatingWindow id="a" title="Окно">
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		expect(read).not.toHaveBeenCalled();
		expect(write).not.toHaveBeenCalled();
	});

	it("восстанавливает сохранённые координаты до первой записи и сохраняет только commit", () => {
		const cached = JSON.stringify({ version: 1, positions: [{ id: "a", x: 140, y: 150 }] });
		localStorage.setItem("floating-test", cached);
		const write = vi.spyOn(Storage.prototype, "setItem");
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows storageKey="floating-test">
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					<input defaultValue="Не сохранять содержимое" />
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		expect(localStorage.getItem("floating-test")).toBe(cached);
		write.mockClear();
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		expect(write).not.toHaveBeenCalled();
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 150, y: 150 });
		expect(JSON.parse(localStorage.getItem("floating-test") ?? "null")).toEqual({
			version: 1,
			positions: [{ id: "a", x: 150, y: 150 }]
		});
	});

	it("пересоздаёт область при смене storageKey без переноса координат предыдущего scope", () => {
		localStorage.setItem("first-layout", JSON.stringify({ version: 1, positions: [{ id: "a", x: 140, y: 150 }] }));
		localStorage.setItem("second-layout", JSON.stringify({ version: 1, positions: [{ id: "a", x: 240, y: 250 }] }));
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const window = (
			<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
				Содержимое
			</FloatingWindow>
		);
		const view = render(<FloatingWindows storageKey="first-layout">{window}</FloatingWindows>);
		act(environment.flushResizeObservers);
		view.rerender(<FloatingWindows storageKey="second-layout">{window}</FloatingWindows>);
		act(environment.flushResizeObservers);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 250, y: 250 });
		expect(JSON.parse(localStorage.getItem("first-layout") ?? "null")).toEqual({
			version: 1,
			positions: [{ id: "a", x: 140, y: 150 }]
		});
	});

	it.each([
		{ reason: "повреждённый JSON", cached: "{" },
		{ reason: "неверный тип координаты", cached: JSON.stringify({ version: 1, positions: [{ id: "a", x: "incorrect", y: 50 }] }) },
		{
			reason: "дублирующиеся ID",
			cached: JSON.stringify({
				version: 1,
				positions: [
					{ id: "a", x: 40, y: 50 },
					{ id: "a", x: 60, y: 70 }
				]
			})
		},
		{ reason: "неизвестная версия", cached: JSON.stringify({ version: 2, positions: [] }) },
		{ reason: "пустой ID", cached: JSON.stringify({ version: 1, positions: [{ id: "", x: 40, y: 50 }] }) },
		{ reason: "бесконечная координата", cached: '{"version":1,"positions":[{"id":"a","x":1e999,"y":50}]}' },
		{
			reason: "слишком много сохранённых окон",
			cached: JSON.stringify({
				version: 1,
				positions: Array.from({ length: 201 }, (_, index) => ({ id: `window-${index}`, x: 40, y: 50 }))
			})
		},
		{ reason: "превышение размера cache", cached: " ".repeat(65_537) }
	])("отбрасывает недоверенный cache и сохраняет управление окном: $reason", ({ cached }) => {
		localStorage.setItem("floating-test", cached);
		const onStorageError = vi.fn();
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows storageKey="floating-test" onStorageError={onStorageError}>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		expect(onStorageError).toHaveBeenCalled();
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("сообщает недоступность localStorage и продолжает работу в памяти", () => {
		const failure = new DOMException("Хранилище запрещено", "SecurityError");
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw failure;
		});
		const onStorageError = vi.fn();
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows storageKey="floating-test" onStorageError={onStorageError}>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		expect(onStorageError).toHaveBeenCalledWith(failure);
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
	});

	it("сообщает ошибку записи после commit, не отменяя новое положение", () => {
		const failure = new DOMException("Хранилище заполнено", "QuotaExceededError");
		const onStorageError = vi.fn();
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		render(
			<FloatingWindows storageKey="floating-test" onStorageError={onStorageError}>
				<FloatingWindow id="a" title="Окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое
				</FloatingWindow>
			</FloatingWindows>
		);
		act(environment.flushResizeObservers);
		expect(onStorageError).not.toHaveBeenCalled();
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw failure;
		});
		const move = getFloatingWindowAction(getFloatingWindowElement("a"), "move");
		fireEvent.keyDown(move, { key: "Enter" });
		fireEvent.keyDown(move, { key: "ArrowRight" });
		fireEvent.keyDown(move, { key: "Enter" });
		expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 50, y: 50 });
		expect(onStorageError).toHaveBeenCalledWith(failure);
	});

	it("гидратирует SSR дерево без mismatch и применяет сохранённое положение", async () => {
		localStorage.setItem("floating-test", JSON.stringify({ version: 1, positions: [{ id: "a", x: 140, y: 150 }] }));
		const onPositionChange = vi.fn<(position: FloatingWindowPosition) => void>();
		const element = (
			<FloatingWindows storageKey="floating-test">
				<FloatingWindow id="a" title="SSR окно" defaultPosition={{ x: 40, y: 50 }} onPositionChange={onPositionChange}>
					Содержимое SSR
				</FloatingWindow>
			</FloatingWindows>
		);
		const container = document.createElement("div");
		container.innerHTML = renderToString(element);
		document.body.append(container);
		const labelId = getFloatingWindowElement("a", container).getAttribute("aria-labelledby");
		const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
		const onRecoverableError = vi.fn();
		const root = hydrateRoot(container, element, { onRecoverableError });

		try {
			await act(async () => undefined);
			act(environment.flushResizeObservers);
			await waitFor(() => expect(getFloatingWindowElement("a", container).getAttribute("aria-labelledby")).toBe(labelId));
			expect(onRecoverableError).not.toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
			const move = getFloatingWindowAction(getFloatingWindowElement("a", container), "move");
			fireEvent.keyDown(move, { key: "Enter" });
			fireEvent.keyDown(move, { key: "ArrowRight" });
			fireEvent.keyDown(move, { key: "Enter" });
			expect(onPositionChange).toHaveBeenCalledExactlyOnceWith({ x: 150, y: 150 });
		} finally {
			await act(async () => root.unmount());
			container.remove();
		}
	});
});
