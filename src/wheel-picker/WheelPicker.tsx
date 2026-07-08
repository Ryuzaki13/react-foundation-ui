import type { CSSProperties, Key, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import {
	clampWheelIndex,
	resolveClosestWheelIndex,
	resolveWheelEdgePadding,
	resolveWheelItemHeight,
	resolveWheelScrollTop,
	resolveWheelViewportHeight
} from "./lib/wheelPickerMath";
import styles from "./WheelPicker.module.scss";

/**
 * Пропсы внутреннего wheel-picker.
 */
export interface WheelPickerProps<T> {
	items: readonly T[];
	value: T;
	onChange: (value: T) => void;
	ariaLabel: string;
	disabled?: boolean;
	className?: string;
	minHeight?: number;
	visibleRows?: number;
	formatItem?: (item: T) => ReactNode;
	getItemKey?: (item: T, index: number) => Key;
}

const DEFAULT_MIN_HEIGHT = 192;
const DEFAULT_VISIBLE_ROWS = 7;
const SNAP_TIMEOUT_MS = 96;

/**
 * Внутренний wheel-picker со snap-кареткой по центру и блокировкой page scroll.
 */
export function WheelPicker<T>({
	items,
	value,
	onChange,
	ariaLabel,
	disabled,
	className,
	minHeight = DEFAULT_MIN_HEIGHT,
	visibleRows = DEFAULT_VISIBLE_ROWS,
	formatItem,
	getItemKey
}: WheelPickerProps<T>) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const snapTimeoutRef = useRef<number | null>(null);
	const valueIndex = useMemo(
		() =>
			Math.max(
				0,
				items.findIndex((item) => Object.is(item, value))
			),
		[items, value]
	);
	const [measuredHeight, setMeasuredHeight] = useState(0);
	const viewportHeight = resolveWheelViewportHeight(measuredHeight, minHeight);
	const itemHeight = resolveWheelItemHeight(viewportHeight, visibleRows);
	const edgePadding = resolveWheelEdgePadding(viewportHeight, itemHeight);
	const lastAppliedIndexRef = useRef(valueIndex);

	/**
	 * Возвращает высоту контентной области wheel без рамок, чтобы избежать накопления высоты.
	 */
	const readContentHeight = useCallback((element: HTMLDivElement) => Math.round(element.clientHeight), []);

	/**
	 * Доводит scroll до ближайшего центра и синхронизирует выбранное значение.
	 */
	const snapToClosestValue = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller || items.length === 0) return;

		const nextIndex = resolveClosestWheelIndex(scroller.scrollTop, itemHeight, items.length);
		scroller.scrollTo({
			top: resolveWheelScrollTop(nextIndex, itemHeight),
			behavior: "smooth"
		});

		if (nextIndex !== lastAppliedIndexRef.current) {
			lastAppliedIndexRef.current = nextIndex;
			onChange(items[nextIndex]);
		}
	}, [itemHeight, items, onChange]);

	/**
	 * Планирует мягкую доводку wheel после завершения scroll/wheel.
	 */
	const scheduleSnap = useCallback(() => {
		if (snapTimeoutRef.current !== null) {
			window.clearTimeout(snapTimeoutRef.current);
		}

		snapTimeoutRef.current = window.setTimeout(() => {
			snapTimeoutRef.current = null;
			snapToClosestValue();
		}, SNAP_TIMEOUT_MS);
	}, [snapToClosestValue]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root || typeof ResizeObserver === "undefined") return;

		const syncMeasuredHeight = (nextHeight: number) => {
			setMeasuredHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight));
		};

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			const nextHeight = Math.round(entry?.contentRect.height ?? readContentHeight(root));

			syncMeasuredHeight(nextHeight);
		});

		observer.observe(root);
		syncMeasuredHeight(readContentHeight(root));

		return () => observer.disconnect();
	}, [readContentHeight]);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller || items.length === 0) return;

		const targetIndex = clampWheelIndex(valueIndex, items.length);
		lastAppliedIndexRef.current = targetIndex;
		scroller.scrollTo({
			top: resolveWheelScrollTop(targetIndex, itemHeight),
			behavior: "auto"
		});
	}, [itemHeight, items.length, valueIndex]);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		const handleScroll = () => {
			if (disabled) return;
			scheduleSnap();
		};

		const handleWheel = (event: WheelEvent) => {
			if (disabled) return;

			event.preventDefault();
			scroller.scrollTop += event.deltaY;
			scheduleSnap();
		};

		scroller.addEventListener("scroll", handleScroll, { passive: true });
		scroller.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			scroller.removeEventListener("scroll", handleScroll);
			scroller.removeEventListener("wheel", handleWheel);
		};
	}, [disabled, items, onChange, scheduleSnap]);

	useEffect(() => {
		return () => {
			if (snapTimeoutRef.current !== null) {
				window.clearTimeout(snapTimeoutRef.current);
			}
		};
	}, []);

	/**
	 * Меняет значение по стрелкам вверх и вниз.
	 */
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (disabled || items.length === 0) return;

		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
		event.preventDefault();

		const delta = event.key === "ArrowUp" ? -1 : 1;
		const nextIndex = clampWheelIndex(valueIndex + delta, items.length);
		if (nextIndex === valueIndex) return;

		lastAppliedIndexRef.current = nextIndex;
		onChange(items[nextIndex]);
	};

	const cssVars = {
		"--wheel-picker-min-height": `${minHeight}px`,
		"--wheel-picker-viewport-height": `${viewportHeight}px`,
		"--wheel-picker-item-height": `${itemHeight}px`,
		"--wheel-picker-edge-padding": `${edgePadding}px`
	} as CSSProperties;

	return (
		<div ref={rootRef} className={cn(styles.wheelPicker, className)} style={cssVars}>
			<div className={styles.viewport}>
				<div
					ref={scrollerRef}
					className={styles.scroller}
					role="listbox"
					tabIndex={disabled ? -1 : 0}
					aria-label={ariaLabel}
					aria-disabled={disabled || undefined}
					onKeyDown={handleKeyDown}>
					<div className={styles.items}>
						{items.map((item, index) => {
							const selected = index === valueIndex;

							return (
								<button
									key={getItemKey?.(item, index) ?? index}
									type="button"
									role="option"
									aria-selected={selected}
									className={styles.item}
									data-selected={selected ? "" : undefined}
									disabled={disabled}
									onClick={() => {
										lastAppliedIndexRef.current = index;
										onChange(item);
									}}>
									{formatItem?.(item) ?? String(item)}
								</button>
							);
						})}
					</div>
				</div>

				<div className={styles.selectionFrame} aria-hidden="true" />
			</div>
		</div>
	);
}
