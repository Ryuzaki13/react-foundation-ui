import { useContext } from "react";

import { createMissingContextError } from "@ryuzaki13/react-foundation-lib/error";

import { FloatingWindowsContext } from "./FloatingWindowsContext";
import { type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Любая вложенная композиция использует ближайшую область; child cloning и глобального registry нет. */
export function useFloatingWindowsStore(): FloatingWindowsStore {
	const store = useContext(FloatingWindowsContext);
	if (!store) throw createMissingContextError({ hookName: "useFloatingWindowsStore", providerName: "FloatingWindows" });
	return store;
}
