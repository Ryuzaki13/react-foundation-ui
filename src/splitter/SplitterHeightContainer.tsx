import { type PropsWithChildren, useId } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./SplitterHeightContainer.module.scss";
import { useSplitterContainerHeight } from "./useSplitterContainerHeight";

export type SplitterHeightContainerProps = PropsWithChildren<{
	/** Controlled-высота области со Splitter в CSS-пикселях. */
	height?: number;
	/** Начальная высота для uncontrolled-режима в CSS-пикселях. */
	defaultHeight?: number;
	minHeight?: number;
	maxHeight?: number;
	/** Шаг изменения высоты с клавиатуры в CSS-пикселях. */
	heightStep?: number;
	/** Сообщает итоговую высоту после завершения drag или клавиатурного шага. */
	onHeightChange?: (height: number) => void;
	className?: string;
	viewportClassName?: string;
	separatorClassName?: string;
	separatorAriaLabel?: string;
}>;

const DEFAULT_HEIGHT = 480;
const DEFAULT_MIN_HEIGHT = 240;
const DEFAULT_MAX_HEIGHT = 1200;
const DEFAULT_HEIGHT_STEP = 20;

/**
 * Опциональная внешняя композиция для Splitter: область панелей получает
 * независимую высоту, а расположенный снизу separator изменяет весь viewport.
 * Внутренние Splitter при этом продолжают управлять только своими пропорциями.
 */
export function SplitterHeightContainer({
	height,
	defaultHeight = DEFAULT_HEIGHT,
	minHeight = DEFAULT_MIN_HEIGHT,
	maxHeight = DEFAULT_MAX_HEIGHT,
	heightStep = DEFAULT_HEIGHT_STEP,
	onHeightChange,
	className,
	viewportClassName,
	separatorClassName,
	separatorAriaLabel = "Изменить высоту рабочей области",
	children
}: SplitterHeightContainerProps) {
	const generatedViewportId = useId();
	const viewportId = `${generatedViewportId}-viewport`;
	const state = useSplitterContainerHeight({
		height,
		defaultHeight,
		minHeight,
		maxHeight,
		heightStep,
		onHeightChange
	});

	return (
		<div className={cn(styles.container, className)} data-ui="splitter-height-container">
			<div
				id={viewportId}
				className={cn(styles.viewport, viewportClassName)}
				style={{ height: state.height }}
				data-ui="splitter-height-viewport">
				{children}
			</div>

			<div
				role="separator"
				aria-label={separatorAriaLabel}
				aria-orientation="horizontal"
				aria-controls={viewportId}
				aria-valuemin={state.minHeight}
				aria-valuemax={state.maxHeight}
				aria-valuenow={state.height}
				aria-valuetext={`${state.height} px`}
				tabIndex={0}
				className={cn(styles.separator, separatorClassName)}
				onPointerDown={state.handleSeparatorPointerDown}
				onKeyDown={state.handleSeparatorKeyDown}
				data-ui="splitter-height-separator"
			/>
		</div>
	);
}
