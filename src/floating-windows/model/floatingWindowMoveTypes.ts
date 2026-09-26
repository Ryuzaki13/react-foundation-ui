import { type ButtonHTMLAttributes, type RefObject } from "react";

import { type FloatingWindowPosition, type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Активный жест держит только preview; authoritative позиция меняется единственным commit. */
export type FloatingWindowMoveSession = {
	origin: FloatingWindowPosition;
	position: FloatingWindowPosition;
	pointer: Readonly<{ id: number; x: number; y: number; target: HTMLButtonElement; scaleX: number; scaleY: number }> | null;
};

export type FloatingWindowMoveOptions = Readonly<{
	id: string;
	store: FloatingWindowsStore;
	panelRef: RefObject<HTMLElement | null>;
	onPositionChange?: (position: FloatingWindowPosition) => void;
}>;

export type FloatingWindowMoveBinding = Pick<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onLostPointerCapture" | "onKeyDown" | "onBlur" | "onClick"
>;

export type FloatingWindowMoveResult = Readonly<{ moving: boolean; handleProps: FloatingWindowMoveBinding }>;
