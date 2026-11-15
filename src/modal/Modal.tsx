import React, { Children, useId } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { GridContainer } from "../grid";

import styles from "./Modal.module.scss";
import { ModalCloseButton } from "./ModalCloseButton";
import { type ModalCompositionProps } from "./modalCompositionTypes";
import { ModalContent } from "./ModalContent";
import { ModalFooter } from "./ModalFooter";
import { ModalFrame } from "./ModalFrame";
import { ModalToolbar } from "./ModalToolbar";
import { type ModalSize } from "./types";

type ToolbarElement = React.ReactElement<ModalCompositionProps, typeof ModalToolbar>;
type ContentElement = React.ReactElement<ModalCompositionProps, typeof ModalContent>;
type FooterElement = React.ReactElement<ModalCompositionProps, typeof ModalFooter>;

type ModalChildren =
	[ToolbarElement, ContentElement, FooterElement] | [ToolbarElement, ContentElement] | [ContentElement, FooterElement] | ContentElement;

export interface ModalProps {
	/** Открыто ли модальное окно */
	isOpen?: boolean;
	/** Заголовок */
	title?: string;
	/** Размер модального окна */
	size?: keyof typeof ModalSize;
	/** Явная высота модального окна выше мобильного breakpoint */
	height?: string;
	/** Обработчик закрытия */
	onClose: () => void;
	children: ModalChildren;
}

/** Стандартное окно с заголовком и составными секциями содержимого. */
export function Modal({ isOpen, title, size, height, onClose, children }: ModalProps) {
	const titleId = useId();
	const contentId = `${titleId}-content`;

	let toolbar: React.ReactNode = null;
	let content: React.ReactNode = null;
	let footer: React.ReactNode = null;

	const childArray = Children.toArray(children) as (ToolbarElement | ContentElement | FooterElement)[];

	for (const child of childArray) {
		const typeName = child.type.displayName;

		switch (typeName) {
			case ModalToolbar.displayName:
				if (toolbar) throw new Error("Modal: duplicate <Toolbar> found");
				toolbar = child;
				break;
			case ModalFooter.displayName:
				if (footer) throw new Error("Modal: duplicate <Footer> found");
				footer = child;
				break;
			case ModalContent.displayName:
				if (content) throw new Error("Modal: duplicate <Content> found");
				content = child;
				break;
		}
	}

	return (
		<ModalFrame isOpen={isOpen} size={size} height={height} onClose={onClose} aria-labelledby={titleId} aria-describedby={contentId}>
			<div className={cn(styles.header, toolbar ? "" : "borderBottom")}>
				<h3 className={styles.headerText} id={titleId}>
					{title}
				</h3>
				<ModalCloseButton className={styles.headerButton} onClose={onClose} />
			</div>

			<GridContainer
				id={contentId}
				templateRows={`${toolbar ? "auto" : ""} 1fr ${footer ? "auto" : ""}`.trim()}
				className={styles.body}>
				{toolbar}
				{content}
				{footer}
			</GridContainer>
		</ModalFrame>
	);
}
