import { type CSSProperties, type PropsWithChildren, type ReactNode, useId } from "react";

import { getOrCreatePortalRoot, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { createPortal } from "react-dom";

import { type ModalProps } from "../modal";

import styles from "./Dialog.module.scss";

/** Набор ширин Dialog совпадает с публичными размерными пресетами Modal. */
export type DialogSize = NonNullable<ModalProps["size"]>;

export type DialogProps = PropsWithChildren<{
	title: ReactNode;
	description: string;
	open: boolean;
	onClose: () => void;
	/** Предустановленная ширина панели с теми же вариантами, что и у Modal. */
	size?: DialogSize;
	/** Дополнительная минимальная ширина, ограниченная выбранным size и viewport. */
	minWidth?: string | number;
}>;

type DialogStyle = CSSProperties & {
	"--dialog-min-width"?: string;
};

/**
 * Модальное диалоговое окно для важных подтверждений и пользовательских сценариев.
 * Ограничивает панель доступной областью viewport и прокручивает большое содержимое.
 */
export function Dialog({ title, description, open, onClose, size, minWidth, children }: DialogProps) {
	const titleId = useId();
	const descriptionId = useId();
	const dialogStyle: DialogStyle = {
		"--dialog-min-width": typeof minWidth === "number" ? `${minWidth}px` : minWidth
	};
	const panelRef = useOverlayFocus<HTMLDivElement>({
		active: open,
		trapFocus: true,
		restoreFocus: true,
		initialFocus: "container"
	});

	useEscapeDismiss({
		active: open,
		onDismiss: onClose,
		containerRef: panelRef
	});

	if (!open) {
		return null;
	}

	if (typeof document === "undefined") {
		return null;
	}

	const portalTarget = getOrCreatePortalRoot("dialog-root");

	if (!portalTarget) {
		return null;
	}

	return createPortal(
		<div className={`${styles.overlay} surfaceBackdrop`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				aria-describedby={description ? descriptionId : undefined}
				tabIndex={-1}
				className={cn(
					styles.panel,
					size && styles.sized,
					size && styles[size],
					"scrollable overscroll surface0 shadowMd paddingLg radiusMd"
				)}
				style={dialogStyle}>
				{title && (
					<h2 id={titleId} className="margin0">
						{title}
					</h2>
				)}
				{description && <p id={descriptionId}>{description}</p>}
				{children}
			</div>
		</div>,
		portalTarget
	);
}
