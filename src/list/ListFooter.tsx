import { type PropsWithChildren } from "react";

type ListFooterProps = PropsWithChildren & Readonly<{ className?: string }>;

/** Дополнительные действия не становятся виртуальными строками и не меняют их измерения. */
export function ListFooter(props: ListFooterProps) {
	// Даже пустая панель занимает ровно один Grid-slot. Оформление и раскладку
	// действий задаёт consumer внутри children, без обязательных border/padding.
	return <div {...props} />;
}
