/** Нативный interaction snapshot одного transfer; не сериализуется и не является состоянием редактора. */
export type StablePortalFocusSnapshot = Readonly<{
	element: HTMLElement;
	inputSelection: Readonly<{ start: number; end: number; direction: "forward" | "backward" | "none" }> | null;
	ranges: ReadonlyArray<Readonly<{ start: Node; startOffset: number; end: Node; endOffset: number }>>;
	selection: Readonly<{ anchor: Node; anchorOffset: number; focus: Node; focusOffset: number }> | null;
}>;

/** Узкая imperative-команда; ref и listener lifetime не выходят из своего hook-владельца. */
export type StablePortalTransfer = (target: HTMLElement | null) => void;
