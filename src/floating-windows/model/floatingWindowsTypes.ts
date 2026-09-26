import { type StoreApi } from "zustand/vanilla";

/** Координаты левого верхнего угла окна относительно его рабочей области. */
export type FloatingWindowPosition = Readonly<{ x: number; y: number }>;

/** Измеренный размер окна либо рабочей области в CSS-пикселях. */
export type FloatingWindowSize = Readonly<{ width: number; height: number }>;

/** Состояние открытого окна; размер неизвестен до первого измерения DOM. */
export type FloatingWindowSnapshot = Readonly<{
	position: FloatingWindowPosition;
	size: FloatingWindowSize | null;
	layer: number;
}>;

/**
 * Один store принадлежит одной рабочей области. Сохранённые позиции переживают
 * закрытие окна, а размер и порядок слоёв относятся только к открытым окнам.
 */
export type FloatingWindowsState = Readonly<{
	windows: ReadonlyMap<string, FloatingWindowSnapshot>;
	positions: ReadonlyMap<string, FloatingWindowPosition>;
	order: readonly string[];
	bounds: FloatingWindowSize | null;
	register: (id: string, defaultPosition?: FloatingWindowPosition) => () => void;
	setPosition: (id: string, position: FloatingWindowPosition) => void;
	setSize: (id: string, size: FloatingWindowSize) => void;
	setBounds: (bounds: FloatingWindowSize | null) => void;
	bringToFront: (id: string) => void;
	restorePositions: (positions: ReadonlyMap<string, FloatingWindowPosition>) => void;
}>;

/** Приватный vanilla-store: React-подписки и persistence принадлежат UI-хосту. */
export type FloatingWindowsStore = StoreApi<FloatingWindowsState>;

/** Смещение начального каскада; ноль отключает разведение новых окон. */
export type FloatingWindowsStoreOptions = Readonly<{ cascadeOffset?: number }>;
