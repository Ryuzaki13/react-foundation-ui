import {
	Children,
	type PropsWithChildren,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Splitter.module.scss";

type SplitterDirection = "vertical" | "horizontal";
type SplitterPane = "start" | "end";

export type SplitterProps = PropsWithChildren<{
	direction?: SplitterDirection;
	initial?: number; // от 0 до 1
	min?: number; // минимальная доля первой панели
	max?: number; // максимальная доля первой панели
	className?: string;
	collapsedPane?: SplitterPane | null;
}>;

type SplitterLogicParams = {
	direction: SplitterDirection;
	initial: number;
	min: number;
	max: number;
	collapsedPane: SplitterPane | null;
};

type SplitterLogic = {
	containerRef: RefObject<HTMLDivElement | null>;
	topLeftRef: RefObject<HTMLDivElement | null>;
	separatorRef: RefObject<HTMLDivElement | null>;
	ratio: number;
	minRatio: number;
	maxRatio: number;
	handleSeparatorPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSeparatorKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

type SplitterViewProps = {
	className?: string;
	direction: SplitterDirection;
	left: ReactNode;
	right: ReactNode;
	collapsedPane: SplitterPane | null;
	logic: SplitterLogic;
};

const DEFAULT_MIN = 0.1;
const DEFAULT_MAX = 0.9;
const DEFAULT_INITIAL = 0.7;
const KEYBOARD_STEP = 0.02;

function clampRatio(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function normalizeRatioValue(value: number, fallback: number) {
	if (!Number.isFinite(value)) return fallback;

	return clampRatio(value, 0, 1);
}

function normalizeBounds(min: number, max: number) {
	const safeMin = normalizeRatioValue(min, DEFAULT_MIN);
	const safeMax = normalizeRatioValue(max, DEFAULT_MAX);

	if (safeMin <= safeMax) return [safeMin, safeMax] as const;

	return [safeMax, safeMin] as const;
}

function getPointerCoordinate(direction: SplitterDirection, event: PointerEvent | ReactPointerEvent<HTMLDivElement>) {
	return direction === "vertical" ? event.clientX : event.clientY;
}

function getContainerDimension(direction: SplitterDirection, rect: DOMRect) {
	return direction === "vertical" ? rect.width : rect.height;
}

function getKeyboardDelta(direction: SplitterDirection, key: string) {
	if (direction === "vertical") {
		if (key === "ArrowLeft") return -KEYBOARD_STEP;
		if (key === "ArrowRight") return KEYBOARD_STEP;
	}

	if (direction === "horizontal") {
		if (key === "ArrowUp") return -KEYBOARD_STEP;
		if (key === "ArrowDown") return KEYBOARD_STEP;
	}

	return null;
}

function resolveTopLeftBasis(ratio: number, collapsedPane: SplitterPane | null) {
	if (collapsedPane === "start") return 0;
	if (collapsedPane === "end") return 1;

	return ratio;
}

function useSplitterLogic({ direction, initial, min, max, collapsedPane }: SplitterLogicParams): SplitterLogic {
	const [minRatio, maxRatio] = normalizeBounds(min, max);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const topLeftRef = useRef<HTMLDivElement | null>(null);
	const separatorRef = useRef<HTMLDivElement | null>(null);
	const cleanupDragRef = useRef<(() => void) | null>(null);
	const pendingRatioRef = useRef<number | null>(null);
	const frameRef = useRef<number | null>(null);
	const startPosRef = useRef(0);
	const startRatioRef = useRef(clampRatio(normalizeRatioValue(initial, DEFAULT_INITIAL), minRatio, maxRatio));
	const previousInitialRef = useRef(initial);

	const [ratio, setRatio] = useState(() => clampRatio(normalizeRatioValue(initial, DEFAULT_INITIAL), minRatio, maxRatio));
	const ratioRef = useRef(ratio);

	const applyRatio = useCallback(
		(nextRatio: number) => {
			ratioRef.current = nextRatio;
			topLeftRef.current?.style.setProperty("flex-basis", `${resolveTopLeftBasis(nextRatio, collapsedPane) * 100}%`);
			separatorRef.current?.setAttribute("aria-valuenow", `${Math.round(nextRatio * 100)}`);
		},
		[collapsedPane]
	);

	const flushPendingRatio = () => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}

		if (pendingRatioRef.current === null) return ratioRef.current;

		const nextRatio = pendingRatioRef.current;
		pendingRatioRef.current = null;
		applyRatio(nextRatio);

		return nextRatio;
	};

	const scheduleRatioUpdate = (nextRatio: number) => {
		pendingRatioRef.current = nextRatio;

		if (frameRef.current !== null) return;

		frameRef.current = requestAnimationFrame(() => {
			frameRef.current = null;

			if (pendingRatioRef.current === null) return;

			applyRatio(pendingRatioRef.current);
		});
	};

	const stopDragging = () => {
		cleanupDragRef.current?.();
		cleanupDragRef.current = null;
	};

	const commitRatio = (nextRatio: number) => {
		flushPendingRatio();
		setRatio(clampRatio(nextRatio, minRatio, maxRatio));
	};

	const handleSeparatorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;

		event.preventDefault();

		const container = containerRef.current;
		if (!container) return;

		stopDragging();

		try {
			event.currentTarget.setPointerCapture?.(event.pointerId);
		} catch {
			// Игнорировать, если браузер не поддерживает pointer capture.
		}

		startPosRef.current = getPointerCoordinate(direction, event);
		startRatioRef.current = ratioRef.current;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			const dimension = getContainerDimension(direction, rect);
			if (dimension <= 0) return;

			const delta = getPointerCoordinate(direction, moveEvent) - startPosRef.current;
			const nextRatio = clampRatio(startRatioRef.current + delta / dimension, minRatio, maxRatio);

			scheduleRatioUpdate(nextRatio);
		};

		const handlePointerUp = () => {
			stopDragging();
			setRatio(flushPendingRatio());
		};

		cleanupDragRef.current = () => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointercancel", handlePointerUp);
		};

		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
		document.addEventListener("pointercancel", handlePointerUp);
	};

	const handleSeparatorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		const keyboardDelta = getKeyboardDelta(direction, event.key);

		if (keyboardDelta !== null) {
			event.preventDefault();
			commitRatio(ratioRef.current + keyboardDelta);

			return;
		}

		if (event.key === "Home") {
			event.preventDefault();
			commitRatio(minRatio);

			return;
		}

		if (event.key === "End") {
			event.preventDefault();
			commitRatio(maxRatio);
		}
	};

	useLayoutEffect(() => {
		applyRatio(ratio);
	}, [applyRatio, ratio]);

	useEffect(() => {
		setRatio((currentRatio) => {
			const initialChanged = previousInitialRef.current !== initial;
			previousInitialRef.current = initial;

			if (initialChanged) {
				return clampRatio(normalizeRatioValue(initial, DEFAULT_INITIAL), minRatio, maxRatio);
			}

			return clampRatio(currentRatio, minRatio, maxRatio);
		});
	}, [initial, minRatio, maxRatio]);

	useEffect(() => {
		return () => {
			stopDragging();

			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	return {
		containerRef,
		topLeftRef,
		separatorRef,
		ratio,
		minRatio,
		maxRatio,
		handleSeparatorPointerDown,
		handleSeparatorKeyDown
	};
}

function SplitterView({ className, direction, left, right, collapsedPane, logic }: SplitterViewProps) {
	const { containerRef, topLeftRef, separatorRef, ratio, minRatio, maxRatio, handleSeparatorPointerDown, handleSeparatorKeyDown } = logic;
	const topLeftBasis = resolveTopLeftBasis(ratio, collapsedPane);
	const isStartPaneCollapsed = collapsedPane === "start";
	const isEndPaneCollapsed = collapsedPane === "end";
	const isSeparatorVisible = collapsedPane === null;

	return (
		<div ref={containerRef} className={cn(styles.splitter, styles[direction], className)}>
			<div ref={topLeftRef} className={styles.topLeft} style={{ flexBasis: `${topLeftBasis * 100}%` }} hidden={isStartPaneCollapsed}>
				{left}
			</div>

			<div
				ref={separatorRef}
				hidden={!isSeparatorVisible}
				role="separator"
				aria-orientation={direction === "vertical" ? "vertical" : "horizontal"}
				aria-valuemin={Math.round(minRatio * 100)}
				aria-valuemax={Math.round(maxRatio * 100)}
				aria-valuenow={Math.round(ratio * 100)}
				tabIndex={isSeparatorVisible ? 0 : -1}
				onPointerDown={handleSeparatorPointerDown}
				onKeyDown={handleSeparatorKeyDown}
				className={styles.separator}></div>

			<div className={styles.bottomRight} hidden={isEndPaneCollapsed}>
				{right}
			</div>
		</div>
	);
}

export function Splitter({
	direction = "vertical",
	initial = DEFAULT_INITIAL,
	min = DEFAULT_MIN,
	max = DEFAULT_MAX,
	className,
	collapsedPane = null,
	children
}: SplitterProps) {
	const [left, right] = Children.toArray(children);
	const logic = useSplitterLogic({ direction, initial, min, max, collapsedPane });

	if (!right) return left;

	return (
		<SplitterView className={className} direction={direction} left={left} right={right} collapsedPane={collapsedPane} logic={logic} />
	);
}
