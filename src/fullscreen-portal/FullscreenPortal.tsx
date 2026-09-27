import { useCallback, useRef, type ReactNode } from "react";

import { FloatingFocusManager, FloatingPortal, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { useDocumentScrollLock, useVisualViewportFrame } from "@ryuzaki13/react-foundation-lib/dom";

import styles from "./FullscreenPortal.module.scss";
import { resolveFullscreenAriaLabel } from "./lib/resolveFullscreenAriaLabel";

/** Props полноэкранного портала для поверхностных UI-блоков. */
export type FullscreenPortalProps = {
	/** Признак открытого fullscreen-режима. */
	open: boolean;
	/** Заголовок содержимого, используемый для доступного имени dialog. */
	title: string;
	/** Описание fullscreen-режима для доступного имени dialog. */
	description: string;
	/** Callback изменения состояния fullscreen-режима. */
	onOpenChange: (open: boolean) => void;
	/** Содержимое, которое нужно отрендерить в полноэкранном слое. */
	children: ReactNode;
};

/** Универсальный fullscreen-портал на базе Floating UI. */
export function FullscreenPortal({ open, title, description, onOpenChange, children }: FullscreenPortalProps) {
	const overlayRef = useRef<HTMLDivElement>(null);
	useDocumentScrollLock({ active: open });
	useVisualViewportFrame({ active: open, containerRef: overlayRef });
	const { refs, context } = useFloating({ open, onOpenChange });
	const dismiss = useDismiss(context, { outsidePress: false });
	const role = useRole(context, { role: "dialog" });
	const { getFloatingProps } = useInteractions([dismiss, role]);
	/** Передает DOM-узел полноэкранной панели в Floating UI context. */
	const setFloating = useCallback(
		(node: HTMLElement | null) => {
			refs.setFloating(node);
		},
		[refs]
	);

	if (!open) return null;

	return (
		<FloatingPortal>
			<div ref={overlayRef} className={styles.overlay}>
				<FloatingFocusManager context={context} modal={false} returnFocus>
					<section
						ref={setFloating}
						{...getFloatingProps({
							className: styles.panel,
							"aria-label": resolveFullscreenAriaLabel(title, description)
						})}>
						{children}
					</section>
				</FloatingFocusManager>
			</div>
		</FloatingPortal>
	);
}
