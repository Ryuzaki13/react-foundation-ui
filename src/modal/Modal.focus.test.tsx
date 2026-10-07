import { Fragment, StrictMode } from "react";

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ModalFocusProbe } from "./ModalFocusProbe.test-fixtures";

function trigger(action: string) {
	const node = document.querySelector<HTMLButtonElement>(`[data-action="${action}"]`);
	if (!node) throw new Error(`Действие ${action} не смонтировано.`);
	return node;
}

beforeEach(() => {
	vi.stubGlobal("scrollTo", vi.fn());
	const appRoot = document.createElement("div");
	appRoot.id = "app-root";
	document.body.append(appRoot);
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	document.getElementById("modal-root")?.remove();
	document.getElementById("app-root")?.remove();
});

describe("Modal: native focus lifecycle без подмены primitive", () => {
	it.each([
		{ strict: false, conditional: false },
		{ strict: true, conditional: false },
		{ strict: false, conditional: true },
		{ strict: true, conditional: true }
	])("StrictMode=$strict conditional=$conditional: exit возвращает исходный trigger", async ({ strict, conditional }) => {
		const Wrapper = strict ? StrictMode : Fragment;
		const container = document.getElementById("app-root");
		if (!container) throw new Error("Контейнер приложения отсутствует.");
		const view = render(
			<Wrapper>
				<ModalFocusProbe mounted={!conditional} isOpen={false} />
			</Wrapper>,
			{ container }
		);
		const first = trigger("first-modal-trigger");
		first.focus();
		view.rerender(
			<Wrapper>
				<ModalFocusProbe mounted isOpen />
			</Wrapper>
		);
		await screen.findByRole("dialog");
		view.rerender(
			<Wrapper>
				<ModalFocusProbe mounted isOpen={false} />
			</Wrapper>
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(first));
	});

	it("persistent false→true повторно захватывает другой trigger", async () => {
		const view = render(
			<StrictMode>
				<ModalFocusProbe mounted isOpen={false} />
			</StrictMode>
		);
		const first = trigger("first-modal-trigger");
		first.focus();
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen />
			</StrictMode>
		);
		await screen.findByRole("dialog");
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen={false} />
			</StrictMode>
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(first));
		const second = trigger("second-modal-trigger");
		second.focus();
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen />
			</StrictMode>
		);
		await screen.findByRole("dialog");
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen={false} />
			</StrictMode>
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(document.activeElement).toBe(second));
	});

	it("новое открытие отменяет ожидающий native restore предыдущего exit", async () => {
		const view = render(
			<StrictMode>
				<ModalFocusProbe mounted isOpen={false} />
			</StrictMode>
		);
		const first = trigger("first-modal-trigger");
		first.focus();
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen />
			</StrictMode>
		);
		await screen.findByRole("dialog");
		const pending = new Map<number, FrameRequestCallback>();
		let nextFrame = 100000;
		const nativeCancel = window.cancelAnimationFrame;
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
			const id = ++nextFrame;
			pending.set(id, callback);
			return id;
		});
		vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
			pending.delete(id);
			nativeCancel(id);
		});
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen={false} />
			</StrictMode>
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(pending.size).toBe(1));
		const oldFrame = [...pending.keys()][0];
		if (oldFrame === undefined) throw new Error("Предыдущий native restore RAF отсутствует.");
		const second = trigger("second-modal-trigger");
		second.focus();
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen />
			</StrictMode>
		);
		await screen.findByRole("dialog");
		expect(window.cancelAnimationFrame).toHaveBeenCalledWith(oldFrame);
		expect(pending.has(oldFrame)).toBe(false);
		view.rerender(
			<StrictMode>
				<ModalFocusProbe mounted isOpen={false} />
			</StrictMode>
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await waitFor(() => expect(pending.size).toBe(1));
		await act(async () => {
			for (const [id, callback] of [...pending]) if (pending.delete(id)) callback(1);
		});
		expect(document.activeElement).toBe(second);
	});
});
