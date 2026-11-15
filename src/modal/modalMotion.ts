import { type Transition, type Variants } from "motion/react";

/** Motion обращается к тем же именам, что и ключи таблицы вариантов. */
export const MODAL_MOTION_HIDDEN = "hidden";
export const MODAL_MOTION_VISIBLE = "visible";

/**
 * Варианты задают единый спокойный переход для появления и удаления modal-панели.
 * Конфигурация приватна для primitive: потребители управляют только состоянием `open`.
 */
export const modalMotionVariants = {
	[MODAL_MOTION_HIDDEN]: {
		opacity: 0,
		scale: 0.9,
		y: 64
	},
	[MODAL_MOTION_VISIBLE]: {
		opacity: 1,
		scale: 1,
		y: 0
	}
} satisfies Variants;

/** Переход сохраняет отзывчивое открытие и дает exit-анимации завершиться до удаления portal content. */
export const modalMotionTransition = {
	duration: 0.25,
	ease: [0.22, 1, 0.36, 1]
} satisfies Transition;

/** При системном reduced-motion остается только мгновенная смена видимости без пространственного движения. */
export const reducedModalMotionTransition = {
	duration: 0
} satisfies Transition;
