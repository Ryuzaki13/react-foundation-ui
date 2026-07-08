// ModalManagerContext.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";

import { ModalManagerContext } from "./useModalManager";

/**
 * Провайдер для централизованного управления стеком модальных окон. Дает вложенным компонентам доступ к открытию и закрытию модалок через контекст.
 */
export function ModalManagerProvider({ children }: { children: React.ReactNode }) {
	const [modals, setModals] = useState<string[]>([]);
	const prevModalsLength = useRef(0);

	const openModal = useCallback((id: string) => {
		setModals((prev) => [...prev, id]);
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
		const wasEmpty = prevModalsLength.current === 0;

		if (wasEmpty && modals.length > 0) {
			// первая модалка открыта — ставим стили
			const scrollY = window.scrollY;
			// const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			const appRoot = document.querySelector("#app-root");

			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			// document.body.style.paddingRight = `${scrollbarWidth}px`;
			appRoot?.setAttribute("inert", "true");

			prevModalsLength.current = modals.length;
			return;
		}

		if (!wasEmpty && modals.length === 0) {
			// последняя модалка закрыта — снимаем стили
			const appRoot = document.querySelector("#app-root");
			const scrollY = parseInt(document.body.style.top || "0") * -1;

			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			// document.body.style.paddingRight = "";

			appRoot?.removeAttribute("inert");

			window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
		}

		prevModalsLength.current = modals.length;
	}, [modals.length]);

	return <ModalManagerContext.Provider value={{ modals, openModal, closeModal, isTopModal }}>{children}</ModalManagerContext.Provider>;
}
