import { type StablePortalFocusSnapshot } from "../model/stablePortalTransferTypes";

import { captureStablePortalFocus } from "./captureStablePortalFocus";
import { restoreStablePortalFocus } from "./restoreStablePortalFocus";

/**
 * Перемещает принадлежащий portal контейнер, сохраняя DOM-state его потомков.
 * document нельзя менять: это также boundary для React events, focus и вложенных portals.
 */
export function moveStablePortalContainer(
	container: HTMLElement,
	target: HTMLElement | null,
	pendingFocus: StablePortalFocusSnapshot | null
): StablePortalFocusSnapshot | null {
	const document = container.ownerDocument;
	if (target !== null && target.ownerDocument !== document) {
		throw new Error("StablePortal не может переносить содержимое в другой document.");
	}
	if (target !== null && (target === container || container.contains(target))) {
		throw new Error("StablePortal не может использовать собственное содержимое как target.");
	}
	if (target !== null && !target.isConnected) {
		throw new Error("StablePortal требует подключённый target либо null.");
	}

	const activeElement = document.activeElement;
	const focused = captureStablePortalFocus(container) ?? pendingFocus;
	// Snapshot нужен лишь при смене host: размер новой области может изменить scroll
	// или browser focus может сбросить его при физическом отключении DOM.
	const scrollPositions = Array.from(container.querySelectorAll<HTMLElement>("*")).flatMap((element) =>
		element.scrollTop !== 0 || element.scrollLeft !== 0 ? [{ element, top: element.scrollTop, left: element.scrollLeft }] : []
	);

	container.setAttribute("data-stable-portal", "");
	container.hidden = target === null;
	container.inert = target === null;
	// display:contents не добавляет техническую box между host layout и children.
	// Inline none обязателен для parking: display:contents иначе перекроет hidden UA rule.
	container.style.display = target === null ? "none" : "contents";
	const parent = target ?? document.body;
	if (container.parentNode !== parent) parent.append(container);

	for (const { element, top, left } of scrollPositions) {
		element.scrollTop = top;
		element.scrollLeft = left;
	}
	if (target === null) {
		if (focused?.element === activeElement) focused.element.blur();
		return focused;
	}
	// После временного parking не крадём фокус у другого control. При обычном
	// переносе восстанавливаем тот же DOM-input, включая нативное выделение текста.
	if (
		focused !== null &&
		(activeElement === focused.element || activeElement === document.body || activeElement === document.documentElement)
	) {
		restoreStablePortalFocus(container, focused);
	}
	return captureStablePortalFocus(container);
}
