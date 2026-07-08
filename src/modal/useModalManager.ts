import { createContext, useContext } from "react";

export const ModalManagerContext = createContext<{
	modals: string[];
	openModal: (id: string) => void;
	closeModal: (id: string) => void;
	isTopModal: (id: string) => boolean;
}>({
	modals: [],
	openModal: () => {},
	closeModal: () => {},
	isTopModal: () => false
});

export const useModalManager = () => useContext(ModalManagerContext);
