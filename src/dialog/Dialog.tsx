import React, { PropsWithChildren, useId } from "react";

import { getOrCreatePortalRoot, useEscapeDismiss, useOverlayFocus } from "@ryuzaki13/react-foundation-lib/dom";
import { createPortal } from "react-dom";

interface DialogProps extends PropsWithChildren {
	title: React.ReactNode;
	description: string;
	open: boolean;
	onClose: () => void;
	minWidth?: string | number;
}

/**
 * Модальное диалоговое окно для важных подтверждений и коротких пользовательских сценариев.
 */
export function Dialog({ title, description, open, onClose, minWidth, children }: DialogProps) {
	const titleId = useId();
	const descriptionId = useId();
	const panelRef = useOverlayFocus<HTMLDivElement>({
		active: open,
		trapFocus: true,
		restoreFocus: true,
		initialFocus: "auto"
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
		<div
			className="fixed inset0 flexCenter surfaceBackdrop"
			style={{ zIndex: "var(--z-dialog)" }}
			onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				aria-describedby={description ? descriptionId : undefined}
				tabIndex={-1}
				className="surface0 shadowMd paddingLg radiusSm"
				style={{ minWidth }}>
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
