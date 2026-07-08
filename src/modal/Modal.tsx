import React, { Children, useEffect, useEffectEvent, useId, useState } from "react";

import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { getOrCreatePortalRoot, useEscapeDismiss, useFocusTrap } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Button } from "../button";
import { FlexContainer } from "../flex";
import { GridContainer } from "../grid";
import { Scrollable } from "../misc";

import styles from "./Modal.module.scss";
import { ModalSize } from "./types";
import { useModalManager } from "./useModalManager";

// Подкомпоненты
export interface ModalCompositionProps {
	children: React.ReactNode;
	className?: string;
}

export const ModalToolbar: React.FC<ModalCompositionProps> = ({ children, className }) => {
	return <div className={cn("surface2 paddingMd borderBottom", className)}>{children}</div>;
};
ModalToolbar.displayName = "Modal.Toolbar";

export const ModalContent: React.FC<ModalCompositionProps & { scrollable?: boolean }> = ({ children, className, scrollable }) => {
	return (
		<div className={cn("paddingMd h100 overflowHidden", className)}>
			{scrollable ? <Scrollable className="h100">{children}</Scrollable> : children}
		</div>
	);
};
ModalContent.displayName = "Modal.Content";

export const ModalFooter: React.FC<ModalCompositionProps> = ({ children, className }) => {
	return (
		<div className={cn("surface2 borderTop paddingMd", className)}>
			<FlexContainer gap="sm" align="center" justify="end">
				{children}
			</FlexContainer>
		</div>
	);
};
ModalFooter.displayName = "Modal.Footer";

type ToolbarElement = React.ReactElement<ModalCompositionProps, typeof ModalToolbar>;
type ContentElement = React.ReactElement<ModalCompositionProps, typeof ModalContent>;
type FooterElement = React.ReactElement<ModalCompositionProps, typeof ModalFooter>;

type ModalChildren =
	| [ToolbarElement, ContentElement, FooterElement]
	| [ToolbarElement, ContentElement]
	| [ContentElement, FooterElement]
	| ContentElement;

export interface ModalProps {
	/** Открыто ли модальное окно */
	isOpen?: boolean;
	/** Заголовок */
	title?: string;
	/** Размер модального окна */
	size?: keyof typeof ModalSize;
	height?: string;
	/** Обработчик закрытия */
	onClose: () => void;
	children: ModalChildren;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, size = "sm", height, onClose, children }) => {
	const modalId = useId();
	const titleId = useId();

	const { modals, openModal, closeModal, isTopModal } = useModalManager();
	const [isMounted, setIsMounted] = useState(false);
	const mountModal = useEffectEvent(() => setIsMounted(true));
	const unmountModal = useEffectEvent(() => setIsMounted(false));

	/**
	 * Если provider менеджера не подключен, считаем одиночную модалку активной,
	 * иначе логика Escape/focus trap никогда не включится.
	 */
	const isActive = isOpen && (modals.length === 0 || isTopModal(modalId));

	const modalRef = useFocusTrap(isOpen || false);

	useEscapeDismiss({
		active: isActive || false,
		onDismiss: onClose,
		containerRef: modalRef
	});

	useEffect(() => {
		if (isOpen) {
			openModal(modalId);
			mountModal();
		}

		return () => {
			closeModal(modalId);
			unmountModal();
		};
	}, [closeModal, isOpen, modalId, openModal]);

	if (!isMounted) return null;

	const modalRoot = getOrCreatePortalRoot("modal-root");

	if (!modalRoot) {
		return null;
	}

	let toolbar: React.ReactNode = null;
	let content: React.ReactNode = null;
	let footer: React.ReactNode = null;

	const childArray = Children.toArray(children) as (ToolbarElement | ContentElement | FooterElement)[];

	for (const child of childArray) {
		const typeName = child.type.displayName;

		switch (typeName) {
			case ModalToolbar.displayName:
				if (toolbar) throw new Error("Modal: duplicate <Toolbar> found");
				toolbar = child; //.props.children;
				break;
			case ModalFooter.displayName:
				if (footer) throw new Error("Modal: duplicate <Footer> found");
				footer = child; //props.children;
				break;
			case ModalContent.displayName:
				if (content) throw new Error("Modal: duplicate <Content> found");
				content = child; //.props.children;
				break;
		}
	}

	return createPortal(
		<>
			<div
				ref={modalRef}
				className={cn(styles.modal, styles[size])}
				style={{ height }}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={`${titleId}-content`}>
				<div className={cn(styles.header, toolbar ? "" : "borderBottom")}>
					<h3 className={styles.headerText} id={titleId}>
						{title}
					</h3>
					<Button
						icon={<X />}
						className={styles.headerButton}
						variant={"ghost"}
						autoFocus={true}
						aria-label={"Закрыть модальное окно"}
						onClick={onClose}
					/>
				</div>

				<GridContainer
					id={`${titleId}-content`}
					templateRows={`${toolbar ? "auto" : ""} 1fr ${footer ? "auto" : ""}`.trim()}
					// gap="md"
					className={styles.body}>
					{toolbar}
					{content}
					{footer}
				</GridContainer>
			</div>
		</>,
		modalRoot
	);
};
