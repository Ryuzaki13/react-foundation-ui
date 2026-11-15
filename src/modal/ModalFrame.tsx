import { type CSSProperties, type ReactNode, useEffect, useId, useRef } from "react";

import { getOrCreatePortalRoot, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

import styles from "./Modal.module.scss";
import {
	MODAL_MOTION_HIDDEN,
	MODAL_MOTION_VISIBLE,
	modalMotionTransition,
	modalMotionVariants,
	reducedModalMotionTransition
} from "./modalMotion";
import { MODAL_PORTAL_ROOT_ID } from "./modalPortalConstants";
import { useModalViewportFrame } from "./model/useModalViewportFrame";
import { ModalSize } from "./types";
import { useModalManager } from "./useModalManager";

type ModalStyle = CSSProperties & {
	"--modal-height"?: string;
};

type ModalFrameProps = {
	open?: boolean;
	size?: keyof typeof ModalSize;
	height?: string;
	onClose: () => void;
	className?: string;
	"aria-label"?: string;
	"aria-labelledby"?: string;
	"aria-describedby"?: string;
	children: ReactNode;
};

/** Общий каркас обычной модалки и модалки с вкладками: геометрия, стек и цикл фокуса. */
export function ModalFrame({
	open,
	size = "sm",
	height,
	onClose,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
	children
}: ModalFrameProps) {
	const modalId = useId();

	const { modals, openModal, closeModal, isTopModal } = useModalManager();
	const shouldReduceMotion = useReducedMotion();
	const restoreFocusTargetRef = useRef<HTMLElement | null>(null);
	const restoreFocusAnimationFrameRef = useRef(0);
	const wasOpenRef = useRef(false);
	const modalStyle: ModalStyle = { "--modal-height": height };

	/**
	 * Если provider менеджера не подключен, считаем одиночную модалку активной,
	 * иначе логика Escape/focus trap никогда не включится.
	 */
	const isActive = open && (modals.length === 0 || isTopModal(modalId));
	useModalViewportFrame(Boolean(open) || modals.includes(modalId));

	useEffect(() => {
		const nextOpen = Boolean(open);
		if (nextOpen && !wasOpenRef.current) {
			// StrictMode повторяет setup без нового открытия: исходный trigger нельзя
			// заменять уже сфокусированной кнопкой внутри Modal. Настоящее повторное
			// открытие отменяет ожидающий restore прошлого exit и захватывает новый trigger.
			window.cancelAnimationFrame(restoreFocusAnimationFrameRef.current);
			restoreFocusAnimationFrameRef.current = 0;
			restoreFocusTargetRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		}
		wasOpenRef.current = nextOpen;
	}, [open]);

	const modalRef = useOverlayFocus<HTMLDivElement>({ active: open || false, trapFocus: true, restoreFocus: false });

	useEscapeDismiss({
		active: isActive || false,
		onDismiss: onClose,
		containerRef: modalRef
	});

	useEffect(() => {
		if (open) {
			openModal(modalId);
		}
	}, [open, modalId, openModal]);

	useEffect(() => {
		return () => {
			window.cancelAnimationFrame(restoreFocusAnimationFrameRef.current);
			closeModal(modalId);
		};
	}, [closeModal, modalId]);

	function handleExitComplete() {
		closeModal(modalId);
		const restoreFocusTarget = restoreFocusTargetRef.current;

		/**
		 * Менеджер снимает inert в passive effect после обновления стека.
		 * Следующий animation frame гарантирует, что trigger снова доступен для фокуса.
		 */
		restoreFocusAnimationFrameRef.current = window.requestAnimationFrame(() => {
			if (restoreFocusTarget?.isConnected) {
				restoreFocusTarget.focus({ preventScroll: true });
			}
			restoreFocusTargetRef.current = null;
		});
	}

	const modalRoot = getOrCreatePortalRoot(MODAL_PORTAL_ROOT_ID);

	if (!modalRoot) {
		return null;
	}

	return createPortal(
		<AnimatePresence onExitComplete={handleExitComplete}>
			{open ? (
				<motion.div
					ref={modalRef}
					className={cn(styles.modal, styles[size], className)}
					style={modalStyle}
					role="dialog"
					aria-modal="true"
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
					initial={MODAL_MOTION_HIDDEN}
					animate={MODAL_MOTION_VISIBLE}
					exit={MODAL_MOTION_HIDDEN}
					variants={modalMotionVariants}
					transition={shouldReduceMotion ? reducedModalMotionTransition : modalMotionTransition}>
					{children}
				</motion.div>
			) : null}
		</AnimatePresence>,
		modalRoot
	);
}
