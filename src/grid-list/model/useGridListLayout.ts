import { useLayoutEffect, useState, useSyncExternalStore } from "react";

import { type GridListGap } from "../gridListTypes";

import { createGridListLayoutDriver } from "./createGridListLayoutDriver";
import { type GridListLayout } from "./gridListLayoutTypes";

/** Изменения CSS props тоже измеряются после commit, даже если внешний размер probe не изменился. */
export function useGridListLayout(minItemWidth: string, gap: GridListGap): GridListLayout {
	const [driver] = useState(createGridListLayoutDriver);
	const snapshot = useSyncExternalStore(driver.subscribe, driver.getSnapshot, driver.getServerSnapshot);
	useLayoutEffect(() => driver.mount(), [driver]);
	useLayoutEffect(() => driver.measure(), [driver, minItemWidth, gap]);
	return { ...snapshot, attachProbe: driver.attachProbe, attachMetricsProbe: driver.attachMetricsProbe };
}
