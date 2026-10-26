import { createRef, type Ref, type RefCallback } from "react";

import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useFloatingPopoverAnchorRef } from "./useFloatingPopoverAnchorRef";

vi.mock("@floating-ui/react", async (importOriginal) => {
	const original = await importOriginal<typeof import("@floating-ui/react")>();
	const { useMemo } = await import("react");

	return {
		...original,
		/**
		 * Граница старого Floating UI: два ref объединяются и мемоизируются,
		 * но возвращённый callback-ref cleanup не передаётся React и не вызывается.
		 */
		useMergeRefs<Value>(refs: (Ref<Value> | undefined)[]): RefCallback<Value> | null {
			const [referenceRef, childRef] = refs;

			return useMemo(() => {
				if (referenceRef == null && childRef == null) return null;

				return (node: Value | null): void => {
					for (const ref of [referenceRef, childRef]) {
						if (typeof ref === "function") ref(node);
						else if (ref) ref.current = node;
					}
				};
			}, [referenceRef, childRef]);
		}
	};
});

describe("useFloatingPopoverAnchorRef с useMergeRefs без поддержки React 19 cleanup", () => {
	it("сохраняет object refs и стабильный reference callback между рендерами", () => {
		const referenceRef = createRef<HTMLElement>();
		const childRef = createRef<HTMLElement>();
		const { result, rerender } = renderHook(() => useFloatingPopoverAnchorRef(referenceRef, childRef));
		const firstCallback = result.current;
		const { unmount } = render(<button type="button" ref={result.current} />);
		const trigger = screen.getByRole("button");

		expect(referenceRef.current).toBe(trigger);
		expect(childRef.current).toBe(trigger);
		rerender();
		expect(result.current).toBe(firstCallback);
		unmount();
		expect(referenceRef.current).toBeNull();
		expect(childRef.current).toBeNull();
	});

	it("передаёт detach как null callback ref без cleanup", () => {
		const referenceRef = vi.fn<(node: HTMLElement | null) => void>();
		const childRef = vi.fn<(node: HTMLElement | null) => void>();
		const { result } = renderHook(() => useFloatingPopoverAnchorRef(referenceRef, childRef));
		const { unmount } = render(<button type="button" ref={result.current} />);
		const trigger = screen.getByRole("button");

		expect(referenceRef).toHaveBeenCalledExactlyOnceWith(trigger);
		expect(childRef).toHaveBeenCalledExactlyOnceWith(trigger);
		unmount();
		expect(referenceRef).toHaveBeenLastCalledWith(null);
		expect(childRef).toHaveBeenLastCalledWith(null);
		expect(childRef).toHaveBeenCalledTimes(2);
	});

	it("вызывает cleanup прежнего callback ref при замене и нового при размонтировании", () => {
		const referenceRef = createRef<HTMLElement>();
		const firstCleanup = vi.fn();
		const secondCleanup = vi.fn();
		const firstRef = vi.fn<RefCallback<HTMLElement>>(() => firstCleanup);
		const secondRef = vi.fn<RefCallback<HTMLElement>>(() => secondCleanup);
		const { result, rerender } = renderHook(
			({ childRef }: { readonly childRef: Ref<HTMLElement> | undefined }) => useFloatingPopoverAnchorRef(referenceRef, childRef),
			{ initialProps: { childRef: firstRef } }
		);
		const view = render(<button type="button" ref={result.current} />);
		const trigger = screen.getByRole("button");

		expect(firstRef).toHaveBeenCalledExactlyOnceWith(trigger);
		expect(firstCleanup).not.toHaveBeenCalled();
		rerender({ childRef: secondRef });
		view.rerender(<button type="button" ref={result.current} />);
		expect(firstCleanup).toHaveBeenCalledTimes(1);
		expect(firstRef).not.toHaveBeenCalledWith(null);
		expect(secondRef).toHaveBeenCalledExactlyOnceWith(trigger);
		expect(referenceRef.current).toBe(trigger);

		view.unmount();
		expect(firstCleanup).toHaveBeenCalledTimes(1);
		expect(secondCleanup).toHaveBeenCalledTimes(1);
		expect(secondRef).not.toHaveBeenCalledWith(null);
		expect(referenceRef.current).toBeNull();
	});

	it("сохраняет симметричный cleanup при StrictMode detach и повторном подключении", () => {
		const referenceRef = createRef<HTMLElement>();
		const cleanup = vi.fn();
		const childRef = vi.fn<RefCallback<HTMLElement>>(() => cleanup);
		const { result } = renderHook(() => useFloatingPopoverAnchorRef(referenceRef, childRef));
		const { unmount } = render(<button type="button" ref={result.current} />, { reactStrictMode: true });
		const trigger = screen.getByRole("button");

		expect(childRef).toHaveBeenNthCalledWith(1, trigger);
		expect(childRef).toHaveBeenNthCalledWith(2, trigger);
		expect(childRef).not.toHaveBeenCalledWith(null);
		expect(cleanup).toHaveBeenCalledTimes(1);
		expect(referenceRef.current).toBe(trigger);
		unmount();
		expect(cleanup).toHaveBeenCalledTimes(2);
		expect(referenceRef.current).toBeNull();
	});

	it("подключает floating reference без пользовательского ref", () => {
		const referenceRef = createRef<HTMLElement>();
		const { result } = renderHook(() => useFloatingPopoverAnchorRef(referenceRef, undefined));
		const { unmount } = render(<button type="button" ref={result.current} />);

		expect(referenceRef.current).toBe(screen.getByRole("button"));
		unmount();
		expect(referenceRef.current).toBeNull();
	});
});
