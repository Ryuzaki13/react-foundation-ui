import { type CSSProperties, type ReactNode } from "react";

import { FloatingWindowsBoundary } from "./FloatingWindowsBoundary";
import { FloatingWindowsProvider } from "./FloatingWindowsProvider";

export type FloatingWindowsProps = Readonly<{
	children: ReactNode;
	className?: string;
	/** Размер и размещение области задаёт host: например, height для панели или position:fixed/inset для слоя страницы. */
	style?: CSSProperties;
	/** Отдельный ключ неавторитетных координат. Без ключа browser storage не используется. Смена ключа пересоздаёт область. */
	storageKey?: string;
	/** Начальный шаг каскада в CSS px; используется только при создании области. */
	cascadeOffset?: number;
	/** Диагностика отказа сохранения; окно продолжает работать в памяти. */
	onStorageError?: (error: unknown) => void;
}>;

/** Независимая немодальная область для свободно размещаемых окон; контент не анализируется и не клонируется. */
export function FloatingWindows({ children, className, style, storageKey, cascadeOffset, onStorageError }: FloatingWindowsProps) {
	if (storageKey !== undefined && !storageKey.trim()) throw new Error("Ключ сохранения области окон не может быть пустым.");
	return (
		<FloatingWindowsProvider key={storageKey} storageKey={storageKey} cascadeOffset={cascadeOffset} onStorageError={onStorageError}>
			<FloatingWindowsBoundary className={className} style={style}>
				{children}
			</FloatingWindowsBoundary>
		</FloatingWindowsProvider>
	);
}
