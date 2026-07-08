import { type PropsWithChildren } from "react";

/**
 * Базовый абзац для внутренней разметки текстового редактора и связанных диалогов.
 */
export function Paragraph({ children }: PropsWithChildren) {
	return <div className={"paragraph"}>{children}</div>;
}
