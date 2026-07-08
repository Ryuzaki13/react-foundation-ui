import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import styles from "./OneStepScroller.module.scss";

interface OneStepScrollerProps {
	children: React.ReactNode;
	className?: string;
	/**
	 * CSS-селектор элементов, которые считаются "шагами" скролла.
	 * По умолчанию используются прямые потомки скроллера.
	 */
	itemSelector?: string;
	/**
	 * Дополнительный внутренний отступ (px) при прокрутке к фокусируемому элементу.
	 */
	scrollPadding?: number;
	/**
	 * Плавная прокрутка для кнопок и авто-доводки до видимости.
	 */
	smooth?: boolean;
}

const EDGE_EPSILON_PX = 1;

function maxScrollLeft(scroller: HTMLElement) {
	return Math.max(0, scroller.scrollWidth - scroller.clientWidth);
}

/**
 * Горизонтальный скроллер "по одному элементу".
 *
 * Ожидает элементы фиксированной ширины (или близкой к фиксированной),
 * чтобы шаг скролла соответствовал ширине одного элемента.
 */
export const OneStepScroller: React.FC<OneStepScrollerProps> = ({
	children,
	className,
	itemSelector,
	scrollPadding = 6,
	smooth = true
}) => {
	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const rafIdRef = useRef<number | null>(null);

	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	/**
	 * Получить список элементов-"шагов".
	 *
	 * Оптимизация: для дефолтного поведения используем `children` DOM-узла,
	 * чтобы не выполнять `querySelectorAll` на каждый вызов.
	 */
	const getItems = useCallback((): HTMLElement[] => {
		const scroller = scrollerRef.current;
		if (!scroller) return [];

		if (!itemSelector) {
			return Array.from(scroller.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
		}

		return Array.from(scroller.querySelectorAll<HTMLElement>(itemSelector));
	}, [itemSelector]);

	/**
	 * Найти "элемент шага" для произвольного target внутри скроллера.
	 */
	const findItemForTarget = useCallback(
		(target: HTMLElement): HTMLElement | null => {
			const scroller = scrollerRef.current;
			if (!scroller) return null;

			if (itemSelector) {
				const item = target.closest<HTMLElement>(itemSelector);
				if (item && scroller.contains(item)) return item;
				return null;
			}

			let node: HTMLElement | null = target;
			while (node && node.parentElement && node.parentElement !== scroller) {
				node = node.parentElement;
			}

			if (node && node.parentElement === scroller) return node;
			return null;
		},
		[itemSelector]
	);

	/**
	 * Обновить состояние кнопок "назад/вперед".
	 * Состояние меняется только при реальном отличии, чтобы не триггерить
	 * лишние перерисовки на каждом событии scroll.
	 */
	const updateScrollButtons = useCallback(() => {
		const scroller = scrollerRef.current;
		if (!scroller) {
			setCanScrollPrev(false);
			setCanScrollNext(false);
			return;
		}

		const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
		const current = Math.max(0, Math.min(scroller.scrollLeft, maxScrollLeft));

		const nextCanScrollPrev = current > EDGE_EPSILON_PX;
		const nextCanScrollNext = current < maxScrollLeft - EDGE_EPSILON_PX;

		setCanScrollPrev((prev) => (prev === nextCanScrollPrev ? prev : nextCanScrollPrev));
		setCanScrollNext((prev) => (prev === nextCanScrollNext ? prev : nextCanScrollNext));
	}, []);

	/**
	 * Запланировать обновление кнопок в следующий animation frame.
	 * Это снижает частоту вычислений при интенсивном scroll/resize.
	 */
	const scheduleUpdateScrollButtons = useCallback(() => {
		if (rafIdRef.current !== null) return;

		rafIdRef.current = requestAnimationFrame(() => {
			rafIdRef.current = null;
			updateScrollButtons();
		});
	}, [updateScrollButtons]);

	/**
	 * Прокрутка на N элементов (N может быть отрицательным).
	 */
	const scrollByItems = useCallback(
		(count: number) => {
			const scroller = scrollerRef.current;
			if (!scroller) return;

			const firstItem = getItems()[0];
			if (!firstItem) return;

			const step = firstItem.getBoundingClientRect().width;
			if (!step) return;

			const delta = Math.round(count * step);
			const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
			const target = Math.max(0, Math.min(scroller.scrollLeft + delta, maxScrollLeft));

			scroller.scrollTo({
				left: target,
				behavior: smooth ? "smooth" : "auto"
			});
		},
		[getItems, smooth]
	);

	/**
	 * Гарантировать полную видимость элемента в пределах viewport скроллера.
	 */
	const ensureFullyVisible = useCallback(
		(el: HTMLElement) => {
			const scroller = scrollerRef.current;
			if (!scroller) return;

			const scrollerRect = scroller.getBoundingClientRect();
			const elementRect = el.getBoundingClientRect();

			const elementLeft = elementRect.left - scrollerRect.left + scroller.scrollLeft;
			const elementRight = elementLeft + elementRect.width;

			const visibleLeft = scroller.scrollLeft;
			const visibleRight = scroller.scrollLeft + scroller.clientWidth;

			if (elementLeft >= visibleLeft + EDGE_EPSILON_PX && elementRight <= visibleRight - EDGE_EPSILON_PX) {
				return;
			}

			let targetScrollLeft = scroller.scrollLeft;
			if (elementLeft < visibleLeft) {
				targetScrollLeft = Math.max(0, elementLeft - scrollPadding);
			} else if (elementRight > visibleRight) {
				targetScrollLeft = Math.min(maxScrollLeft(scroller), elementRight - scroller.clientWidth + scrollPadding);
			}

			scroller.scrollTo({
				left: Math.round(targetScrollLeft),
				behavior: smooth ? "smooth" : "auto"
			});
		},
		[scrollPadding, smooth]
	);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		const handleFocusIn = (event: FocusEvent) => {
			const target = event.target;
			if (!(target instanceof HTMLElement)) return;

			const item = findItemForTarget(target);
			if (item) ensureFullyVisible(item);
		};

		scroller.addEventListener("focusin", handleFocusIn);
		return () => scroller.removeEventListener("focusin", handleFocusIn);
	}, [ensureFullyVisible, findItemForTarget]);

	/**
	 * Наблюдаем только за размером скроллера и изменением его DOM-структуры.
	 * Это дешевле, чем подписка ResizeObserver на каждый элемент + IntersectionObserver.
	 */
	useEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;

		const onScroll = () => scheduleUpdateScrollButtons();
		scroller.addEventListener("scroll", onScroll, { passive: true });

		let resizeObserver: ResizeObserver | null = null;
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(scheduleUpdateScrollButtons);
			resizeObserver.observe(scroller);
		}

		let mutationObserver: MutationObserver | null = null;
		if (typeof MutationObserver !== "undefined") {
			mutationObserver = new MutationObserver(scheduleUpdateScrollButtons);
			mutationObserver.observe(scroller, {
				childList: true,
				subtree: false
			});
		}

		scheduleUpdateScrollButtons();

		return () => {
			scroller.removeEventListener("scroll", onScroll);
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();

			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
		};
	}, [scheduleUpdateScrollButtons]);

	/**
	 * При изменении children просим пересчитать видимость кнопок.
	 */
	useEffect(() => {
		scheduleUpdateScrollButtons();
	}, [children, scheduleUpdateScrollButtons]);

	const handlePrev = () => scrollByItems(-1);
	const handleNext = () => scrollByItems(1);

	/**
	 * Клавиатурная доступность: стрелки влево/вправо двигают на один шаг.
	 */
	const onWrapperKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			handlePrev();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			handleNext();
		}
	};

	const hasScroll = canScrollPrev || canScrollNext;

	return (
		<div className={cn(styles.oneStepScroller, className)} style={{ position: "relative" }}>
			{hasScroll && (
				<button
					type="button"
					aria-label="Прокрутить шаг влево"
					className={styles.ossButton}
					onClick={handlePrev}
					disabled={!canScrollPrev}>
					<ChevronLeftIcon />
				</button>
			)}

			<div className={styles.ossViewport} onKeyDown={onWrapperKeyDown} role="group" aria-label="Элементы прокрутки">
				<div className={styles.ossScroller} ref={scrollerRef} aria-live="polite">
					{children}
				</div>
			</div>

			{hasScroll && (
				<button
					type="button"
					aria-label="Прокрутить шаг вправо"
					className={styles.ossButton}
					onClick={handleNext}
					disabled={!canScrollNext}>
					<ChevronRightIcon />
				</button>
			)}
		</div>
	);
};
