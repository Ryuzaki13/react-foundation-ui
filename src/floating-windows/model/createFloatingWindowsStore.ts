import { createStore } from "zustand/vanilla";

import { constrainFloatingWindowPosition } from "../lib/constrainFloatingWindowPosition";
import { isFloatingWindowId } from "../lib/isFloatingWindowId";
import { selectFloatingWindowCascadePosition } from "../lib/selectFloatingWindowCascadePosition";

import {
	type FloatingWindowPosition,
	type FloatingWindowSnapshot,
	type FloatingWindowsState,
	type FloatingWindowsStore,
	type FloatingWindowsStoreOptions
} from "./floatingWindowsTypes";

/**
 * Создаёт изолированное состояние одной группы modeless-окон. Здесь нет DOM,
 * подписок React и storage: последовательные команды всегда читают актуальный
 * snapshot, а неизменённые окна сохраняют identity для узких UI-подписок.
 */
export function createFloatingWindowsStore({ cascadeOffset = 24 }: FloatingWindowsStoreOptions = {}): FloatingWindowsStore {
	if (!Number.isFinite(cascadeOffset) || cascadeOffset < 0) {
		throw new RangeError("Смещение каскада должно быть конечным неотрицательным числом.");
	}

	return createStore<FloatingWindowsState>()((set, get) => ({
		windows: new Map<string, FloatingWindowSnapshot>(),
		positions: new Map<string, FloatingWindowPosition>(),
		order: [],
		bounds: null,

		register: (id, defaultPosition = { x: 24, y: 24 }) => {
			if (!isFloatingWindowId(id)) {
				throw new Error("Идентификатор плавающего окна должен содержать от 1 до 256 символов и не состоять из пробелов.");
			}
			const state = get();
			if (state.windows.has(id)) {
				throw new Error(`Плавающее окно с идентификатором «${id}» уже открыто в этой рабочей области.`);
			}

			constrainFloatingWindowPosition(defaultPosition, null, null);
			const savedPosition = state.positions.get(id);
			const position =
				savedPosition ??
				selectFloatingWindowCascadePosition(
					defaultPosition,
					Array.from(state.windows.values(), (window) => window.position),
					cascadeOffset
				);
			const order = [...state.order, id];
			const windows = new Map(state.windows);
			windows.set(id, { position, size: null, layer: order.length });
			const positions = savedPosition ? state.positions : new Map(state.positions).set(id, position);
			set({ windows, positions, order });

			let registered = true;

			return () => {
				if (!registered) return;
				registered = false;

				set((current) => {
					const order = current.order.filter((windowId) => windowId !== id);
					const windows = new Map(current.windows);
					windows.delete(id);

					order.forEach((windowId, index) => {
						const snapshot = windows.get(windowId);
						if (snapshot && snapshot.layer !== index + 1) {
							windows.set(windowId, { ...snapshot, layer: index + 1 });
						}
					});

					return { windows, order };
				});
			};
		},

		setPosition: (id, position) => {
			set((state) => {
				const snapshot = state.windows.get(id);
				// Завершающее событие указателя может прийти после удаления DOM-окна.
				if (!snapshot) return state;
				const constrained = constrainFloatingWindowPosition(position, snapshot.size, state.bounds);
				if (snapshot.position.x === constrained.x && snapshot.position.y === constrained.y) return state;

				return {
					windows: new Map(state.windows).set(id, { ...snapshot, position: constrained }),
					positions: new Map(state.positions).set(id, constrained)
				};
			});
		},

		setSize: (id, size) => {
			set((state) => {
				const snapshot = state.windows.get(id);
				if (!snapshot) return state;
				const position = constrainFloatingWindowPosition(snapshot.position, size, state.bounds);
				if (snapshot.size?.width === size.width && snapshot.size.height === size.height && position === snapshot.position) {
					return state;
				}

				return {
					windows: new Map(state.windows).set(id, { ...snapshot, position, size }),
					positions: position === snapshot.position ? state.positions : new Map(state.positions).set(id, position)
				};
			});
		},

		setBounds: (bounds) => {
			constrainFloatingWindowPosition({ x: 0, y: 0 }, null, bounds);

			set((state) => {
				if (state.bounds?.width === bounds?.width && state.bounds?.height === bounds?.height) return state;

				const windows = new Map(state.windows);
				const positions = new Map(state.positions);
				let repositioned = false;

				for (const [id, snapshot] of state.windows) {
					const position = constrainFloatingWindowPosition(snapshot.position, snapshot.size, bounds);
					if (position === snapshot.position) continue;

					repositioned = true;
					windows.set(id, { ...snapshot, position });
					positions.set(id, position);
				}

				return {
					bounds,
					windows: repositioned ? windows : state.windows,
					positions: repositioned ? positions : state.positions
				};
			});
		},

		bringToFront: (id) => {
			set((state) => {
				if (!state.windows.has(id) || state.order.at(-1) === id) return state;

				const order = [...state.order.filter((windowId) => windowId !== id), id];
				const windows = new Map(state.windows);

				order.forEach((windowId, index) => {
					const snapshot = windows.get(windowId);
					if (snapshot && snapshot.layer !== index + 1) {
						windows.set(windowId, { ...snapshot, layer: index + 1 });
					}
				});

				return { windows, order };
			});
		},

		restorePositions: (restoredPositions) => {
			// Сначала проверяем весь snapshot: ошибка не должна частично применить восстановление.
			for (const [id, position] of restoredPositions) {
				if (!isFloatingWindowId(id)) {
					throw new Error("Идентификатор плавающего окна должен содержать от 1 до 256 символов и не состоять из пробелов.");
				}
				constrainFloatingWindowPosition(position, null, null);
			}

			set((state) => {
				const positions = new Map<string, FloatingWindowPosition>();
				for (const [id, position] of restoredPositions) {
					const saved = state.positions.get(id);
					positions.set(id, saved && saved.x === position.x && saved.y === position.y ? saved : position);
				}

				const windows = new Map(state.windows);
				let repositioned = false;

				for (const [id, snapshot] of state.windows) {
					const constrained = constrainFloatingWindowPosition(
						positions.get(id) ?? snapshot.position,
						snapshot.size,
						state.bounds
					);
					const unchanged = constrained.x === snapshot.position.x && constrained.y === snapshot.position.y;
					const position = unchanged ? snapshot.position : constrained;
					positions.set(id, position);
					if (unchanged) continue;

					repositioned = true;
					windows.set(id, { ...snapshot, position });
				}

				const samePositions =
					positions.size === state.positions.size &&
					Array.from(positions).every(([id, position]) => state.positions.get(id) === position);
				if (!repositioned && samePositions) return state;

				return { windows: repositioned ? windows : state.windows, positions: samePositions ? state.positions : positions };
			});
		}
	}));
}
