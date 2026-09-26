import { useEffect, useEffectEvent, useRef, useState } from "react";

import { constrainFloatingWindowPosition } from "../lib/constrainFloatingWindowPosition";

import { type FloatingWindowMoveOptions, type FloatingWindowMoveResult, type FloatingWindowMoveSession } from "./floatingWindowMoveTypes";
import { type FloatingWindowPosition } from "./floatingWindowsTypes";

/** Pointer capture и клавиатура используют одну транзакцию перемещения. RAF не обновляет React/store на каждом кадре. */
export function useFloatingWindowMove({ id, store, panelRef, onPositionChange }: FloatingWindowMoveOptions): FloatingWindowMoveResult {
	const sessionRef = useRef<FloatingWindowMoveSession | null>(null);
	const frameRef = useRef<number | null>(null);
	const [moving, setMoving] = useState(false);

	const clearPreview = () => {
		if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		frameRef.current = null;
		panelRef.current?.style.removeProperty("transform");
	};
	const release = (session: FloatingWindowMoveSession | null) => {
		if (session?.pointer?.target.hasPointerCapture(session.pointer.id)) {
			session.pointer.target.releasePointerCapture(session.pointer.id);
		}
	};
	const finish = (commit: boolean) => {
		const session = sessionRef.current;
		if (!session) return;
		sessionRef.current = null;
		clearPreview();
		release(session);
		setMoving(false);
		if (!commit) return;
		store.getState().setPosition(id, session.position);
		const position = store.getState().windows.get(id)?.position;
		if (position && (position.x !== session.origin.x || position.y !== session.origin.y)) onPositionChange?.(position);
	};
	const preview = (position: FloatingWindowPosition) => {
		const session = sessionRef.current;
		if (!session) return;
		const state = store.getState();
		session.position = constrainFloatingWindowPosition(position, state.windows.get(id)?.size ?? null, state.bounds);
		if (frameRef.current !== null) return;
		frameRef.current = requestAnimationFrame(() => {
			frameRef.current = null;
			const current = sessionRef.current;
			if (current && panelRef.current) {
				panelRef.current.style.transform = `translate(${current.position.x - current.origin.x}px, ${current.position.y - current.origin.y}px)`;
			}
		});
	};
	const begin = (pointer: FloatingWindowMoveSession["pointer"]) => {
		if (sessionRef.current) return;
		const snapshot = store.getState().windows.get(id);
		if (!snapshot) return;
		store.getState().bringToFront(id);
		sessionRef.current = { origin: snapshot.position, position: snapshot.position, pointer };
		setMoving(true);
	};
	const cancelOnGeometryChange = useEffectEvent(() => finish(false));
	const dispose = useEffectEvent(() => {
		const session = sessionRef.current;
		sessionRef.current = null;
		clearPreview();
		release(session);
	});
	useEffect(() => {
		const unsubscribe = store.subscribe((state, previous) => {
			const before = previous.windows.get(id);
			const after = state.windows.get(id);
			if (state.bounds !== previous.bounds || before?.size !== after?.size || before?.position !== after?.position)
				cancelOnGeometryChange();
		});
		return () => {
			unsubscribe();
			dispose();
		};
	}, [store, id]);

	return {
		moving,
		handleProps: {
			onClick: (event) => {
				// Assistive activation может послать click без keyboard/pointer событий.
				// Обычный pointer click после pointerup не должен начинать второй жест.
				if (event.detail !== 0 || sessionRef.current?.pointer) return;
				if (sessionRef.current) finish(true);
				else begin(null);
			},
			onPointerDown: (event) => {
				if (event.button !== 0 || !event.isPrimary || sessionRef.current) return;
				event.preventDefault();
				event.currentTarget.focus({ preventScroll: true });
				const panel = panelRef.current;
				if (!panel) return;
				const rect = panel.getBoundingClientRect();
				begin({
					id: event.pointerId,
					x: event.clientX,
					y: event.clientY,
					target: event.currentTarget,
					scaleX: panel.offsetWidth > 0 && rect.width > 0 ? rect.width / panel.offsetWidth : 1,
					scaleY: panel.offsetHeight > 0 && rect.height > 0 ? rect.height / panel.offsetHeight : 1
				});
				event.currentTarget.setPointerCapture(event.pointerId);
			},
			onPointerMove: (event) => {
				const session = sessionRef.current;
				if (!session?.pointer || session.pointer.id !== event.pointerId) return;
				preview({
					x: session.origin.x + (event.clientX - session.pointer.x) / session.pointer.scaleX,
					y: session.origin.y + (event.clientY - session.pointer.y) / session.pointer.scaleY
				});
			},
			onPointerUp: (event) => {
				const session = sessionRef.current;
				if (!session?.pointer || session.pointer.id !== event.pointerId) return;
				preview({
					x: session.origin.x + (event.clientX - session.pointer.x) / session.pointer.scaleX,
					y: session.origin.y + (event.clientY - session.pointer.y) / session.pointer.scaleY
				});
				finish(true);
			},
			onPointerCancel: (event) => {
				if (sessionRef.current?.pointer?.id === event.pointerId) finish(false);
			},
			onLostPointerCapture: (event) => {
				if (sessionRef.current?.pointer?.id === event.pointerId) finish(false);
			},
			onBlur: () => finish(false),
			onKeyDown: (event) => {
				if (event.defaultPrevented) return;
				if (event.key === "Escape" && sessionRef.current) {
					event.preventDefault();
					event.stopPropagation();
					finish(false);
					return;
				}
				if ((event.key === " " || event.key === "Enter") && !sessionRef.current?.pointer) {
					event.preventDefault();
					if (event.repeat) return;
					if (sessionRef.current) finish(true);
					else begin(null);
					return;
				}
				const session = sessionRef.current;
				if (!session || session.pointer) return;
				const step = event.shiftKey ? 1 : 10;
				const x = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
				const y = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
				if (x || y) {
					event.preventDefault();
					preview({ x: session.position.x + x, y: session.position.y + y });
				}
			}
		}
	};
}
