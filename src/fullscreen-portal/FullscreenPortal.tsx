import { useCallback, type ReactNode } from "react";

import {
	FloatingFocusManager,
	FloatingOverlay,
	FloatingPortal,
	useDismiss,
	useFloating,
	useInteractions,
	useRole
} from "@floating-ui/react";

import styles from "./FullscreenPortal.module.scss";

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

/** Формирует доступное имя dialog из заголовка и описания fullscreen-режима. */
function resolveFullscreenAriaLabel(title: string, description: string): string {
	const trimmedTitle = title.trim();
	return trimmedTitle ? `${trimmedTitle}. ${description}` : description;
}

/** Универсальный fullscreen-портал на базе Floating UI. */
export function FullscreenPortal({ open, title, description, onOpenChange, children }: FullscreenPortalProps) {
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
			<FloatingOverlay lockScroll className={styles.overlay}>
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
			</FloatingOverlay>
		</FloatingPortal>
	);
}
