import { createContext } from "react";

import { type FloatingWindowsStore } from "./floatingWindowsTypes";

/** Context передаёт стабильный store конкретной области, а не изменяющийся снимок всех окон. */
export const FloatingWindowsContext = createContext<FloatingWindowsStore | null>(null);
