import { type ReactNode } from "react";

/** Общий опубликованный контракт слотов составной модалки. */
export interface ModalCompositionProps {
	children: ReactNode;
	className?: string;
}
