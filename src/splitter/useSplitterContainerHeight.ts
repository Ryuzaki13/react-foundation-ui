import {
	type KeyboardEvent as ReactKeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from "react";

import { clampNumberScaleValue, offsetNumberScaleValue, resolveNumberScaleBounds } from "@ryuzaki13/react-foundation-lib/number-scale";

type UseSplitterContainerHeightParams = {
	height?: number;
	defaultHeight: number;
	minHeight: number;
	maxHeight: number;
	heightStep: number;
	onHeightChange?: (height: number) => void;
};

type SplitterContainerHeightState = {
	height: number;
	minHeight: number;
	maxHeight: number;
	handleSeparatorPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
	handleSeparatorKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

/**
 * Управляет controlled/uncontrolled-высотой внешнего контейнера Splitter.
 * Pointer-изменения обновляют только локальный draft, а `onHeightChange`
 * получает итоговое значение после завершения жеста или клавиатурного шага.
 */
export function useSplitterContainerHeight({
	height,
	defaultHeight,
	minHeight,
	maxHeight,
	heightStep,
	onHeightChange
}: UseSplitterContainerHeightParams): SplitterContainerHeightState {
	const bounds = resolveNumberScaleBounds(minHeight, maxHeight);
	const scale = { ...bounds, step: heightStep };
	const controlled = height !== undefined;
	const [uncontrolledHeight, setUncontrolledHeight] = useState(() => clampNumberScaleValue(defaultHeight, bounds.min, bounds.max));
	const [dragHeight, setDragHeight] = useState<number | null>(null);
	const resolvedHeight = clampNumberScaleValue(height ?? uncontrolledHeight, bounds.min, bounds.max);
	const currentHeight = dragHeight ?? resolvedHeight;

	const cleanupDragRef = useRef<(() => void) | null>(null);
	const frameRef = useRef<number | null>(null);
	const pendingHeightRef = useRef<number | null>(null);
	const currentHeightRef = useRef(currentHeight);
	const startHeightRef = useRef(currentHeight);
	const startPointerYRef = useRef(0);

	const flushPendingHeight = () => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}

		if (pendingHeightRef.current === null) return currentHeightRef.current;

		const nextHeight = pendingHeightRef.current;
		pendingHeightRef.current = null;
		currentHeightRef.current = nextHeight;

		return nextHeight;
	};

	const scheduleHeightUpdate = (nextHeight: number) => {
		pendingHeightRef.current = nextHeight;

		if (frameRef.current !== null) return;

		frameRef.current = requestAnimationFrame(() => {
			frameRef.current = null;

			if (pendingHeightRef.current === null) return;

			const scheduledHeight = pendingHeightRef.current;
			pendingHeightRef.current = null;
			currentHeightRef.current = scheduledHeight;
			setDragHeight(scheduledHeight);
		});
	};

	const commitHeight = (nextHeight: number, previousHeight = currentHeightRef.current) => {
		const committedHeight = clampNumberScaleValue(nextHeight, bounds.min, bounds.max);
		currentHeightRef.current = committedHeight;
		setDragHeight(null);

		if (committedHeight === previousHeight) return;

		if (!controlled) {
			setUncontrolledHeight(committedHeight);
		}

		onHeightChange?.(committedHeight);
	};

	const stopDragging = () => {
		cleanupDragRef.current?.();
		cleanupDragRef.current = null;
	};

	const handleSeparatorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;

		event.preventDefault();
		stopDragging();

		try {
			event.currentTarget.setPointerCapture?.(event.pointerId);
		} catch {
			// Браузер может не поддерживать pointer capture для synthetic-события.
		}

		startPointerYRef.current = event.clientY;
		startHeightRef.current = currentHeightRef.current;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const pointerDelta = moveEvent.clientY - startPointerYRef.current;
			const nextHeight = clampNumberScaleValue(startHeightRef.current + pointerDelta, bounds.min, bounds.max);
			scheduleHeightUpdate(nextHeight);
		};

		const handlePointerUp = () => {
			stopDragging();
			commitHeight(flushPendingHeight(), startHeightRef.current);
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
		let nextHeight: number | undefined;

		if (event.key === "ArrowUp") nextHeight = offsetNumberScaleValue(currentHeight, -1, scale);
		if (event.key === "ArrowDown") nextHeight = offsetNumberScaleValue(currentHeight, 1, scale);
		if (event.key === "Home") nextHeight = bounds.min;
		if (event.key === "End") nextHeight = bounds.max;
		if (nextHeight === undefined) return;

		event.preventDefault();
		commitHeight(nextHeight, currentHeight);
	};

	useLayoutEffect(() => {
		currentHeightRef.current = currentHeight;
	}, [currentHeight]);

	useEffect(() => {
		return () => {
			stopDragging();

			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	return {
		height: currentHeight,
		minHeight: bounds.min,
		maxHeight: bounds.max,
		handleSeparatorPointerDown,
		handleSeparatorKeyDown
	};
}
