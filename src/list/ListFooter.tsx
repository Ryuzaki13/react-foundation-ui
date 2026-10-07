import { type PropsWithChildren } from "react";

/** Дополнительные действия не становятся виртуальными строками и не меняют их измерения. */
export function ListFooter({ children }: PropsWithChildren) {
	// Даже пустая панель занимает ровно один Grid-slot. Оформление и раскладку
	// действий задаёт consumer внутри children, без обязательных border/padding.
	return <div>{children}</div>;
}
