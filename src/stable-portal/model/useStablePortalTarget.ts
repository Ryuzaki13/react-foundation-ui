import { useLayoutEffect } from "react";

import { useStablePortalTransfer } from "./useStablePortalTransfer";

/** Синхронизирует только внешний DOM-parent; React children и их effects не пересоздаются при переносе. */
export function useStablePortalTarget(container: HTMLElement | null, target: HTMLElement | null): void {
	const transfer = useStablePortalTransfer(container);
	useLayoutEffect(() => {
		transfer(target);
	}, [transfer, target]);
}
