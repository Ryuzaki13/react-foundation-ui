import { useState, type ReactNode } from "react";

import { createFloatingWindowsStore } from "./model/createFloatingWindowsStore";
import { FloatingWindowsContext } from "./model/FloatingWindowsContext";
import { useFloatingWindowsPersistence } from "./model/useFloatingWindowsPersistence";

type FloatingWindowsProviderProps = Readonly<{
	children: ReactNode;
	cascadeOffset?: number;
	storageKey?: string;
	onStorageError?: (error: unknown) => void;
}>;

/** Один экземпляр области — один store. Провайдер компонует владельцев state/persistence, не реализуя их алгоритмы. */
export function FloatingWindowsProvider({ children, cascadeOffset, storageKey, onStorageError }: FloatingWindowsProviderProps) {
	const [store] = useState(() => createFloatingWindowsStore({ cascadeOffset }));
	useFloatingWindowsPersistence(store, storageKey, onStorageError);
	return <FloatingWindowsContext value={store}>{children}</FloatingWindowsContext>;
}
