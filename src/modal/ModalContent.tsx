import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Scrollable } from "../misc";

import styles from "./Modal.module.scss";
import { type ModalCompositionProps } from "./modalCompositionTypes";

type ModalContentProps = ModalCompositionProps & { scrollable?: boolean };

/** Основная область; optional Scrollable остаётся внутренним scroll host модалки. */
export function ModalContent({ children, className, scrollable }: ModalContentProps) {
	return (
		<div className={cn(styles.content, scrollable ? styles.contentScrollable : undefined, className)}>
			{scrollable ? <Scrollable className={styles.scrollable}>{children}</Scrollable> : children}
		</div>
	);
}
ModalContent.displayName = "Modal.Content";
