// ModalManagerContext.tsx
import React, { useCallback, useEffect, useState } from "react";

import { useDocumentScrollLock } from "@ryuzaki13/react-foundation-lib/dom";

import { ModalManagerContext } from "./useModalManager";

const MODAL_INERT_ATTRIBUTE = "inert";

export interface ModalManagerProviderProps {
	children: React.ReactNode;
	/** Компенсирует исчезновение скроллбара правым padding у body. */
	compensateScrollbar?: boolean;
}

/**
 * Провайдер для централизованного управления стеком модальных окон. Дает вложенным компонентам доступ к открытию и закрытию модалок через контекст.
 */
export function ModalManagerProvider({ children, compensateScrollbar = false }: ModalManagerProviderProps) {
	const [modals, setModals] = useState<string[]>([]);
	const active = modals.length > 0;
	useDocumentScrollLock({ active, compensateScrollbar });

	const openModal = useCallback((id: string) => {
		setModals((prev) => (prev.includes(id) ? prev : [...prev, id]));
	}, []);

	const closeModal = useCallback((id: string) => {
		setModals((prev) => prev.filter((mid) => mid !== id));
	}, []);

	const isTopModal = useCallback(
		(id: string) => {
			return modals[modals.length - 1] === id;
		},
		[modals]
	);

	useEffect(() => {
		if (!active) return;
		// Сохраняем опубликованную границу inert: provider не угадывает состав app shell.
		const appRoot = document.querySelector("#app-root");
		if (!appRoot) return;
		const previousInert = appRoot.getAttribute(MODAL_INERT_ATTRIBUTE);
		appRoot.setAttribute(MODAL_INERT_ATTRIBUTE, "true");
		return () => {
			if (appRoot.getAttribute(MODAL_INERT_ATTRIBUTE) !== "true") return;
			if (previousInert === null) appRoot.removeAttribute(MODAL_INERT_ATTRIBUTE);
			else appRoot.setAttribute(MODAL_INERT_ATTRIBUTE, previousInert);
		};
	}, [active]);

	return <ModalManagerContext.Provider value={{ modals, openModal, closeModal, isTopModal }}>{children}</ModalManagerContext.Provider>;
}
