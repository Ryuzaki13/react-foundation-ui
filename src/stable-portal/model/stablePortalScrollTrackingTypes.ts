/** Приватный DOM-snapshot: только нативные offsets, без React/editor/server state. */
export type StablePortalScrollTracking = Readonly<{
	connect: () => () => void;
	capture: () => void;
	restore: () => void;
}>;
