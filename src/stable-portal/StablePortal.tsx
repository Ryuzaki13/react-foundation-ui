import { type ReactNode } from "react";

import { useFloatingPortalNode } from "@floating-ui/react";
import { createPortal } from "react-dom";

import { useStablePortalTarget } from "./model/useStablePortalTarget";

export type StablePortalProps = Readonly<{
	/** Подключённая область того же document; null временно скрывает, но не размонтирует содержимое. */
	target: HTMLElement | null;
	children: ReactNode;
}>;

/**
 * Переносит один React subtree между DOM-областями без смены portal identity.
 * Владелец должен оставлять сам StablePortal mounted над меняющимися hosts;
 * видимость и активность прикладных подписок остаются ответственностью владельца.
 */
export function StablePortal({ target, children }: StablePortalProps) {
	// Публичный lifecycle Floating UI создаёт контейнер только после browser commit,
	// удаляет его при unmount и оставляет одинаковый пустой SSR/hydration render.
	const container = useFloatingPortalNode();
	useStablePortalTarget(container, target);
	return container === null ? null : createPortal(children, container);
}
