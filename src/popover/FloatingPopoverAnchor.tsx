import React, { cloneElement, Fragment, isValidElement } from "react";

import { type UseInteractionsReturn } from "@floating-ui/react";

import { useFloatingPopoverAnchorRef } from "./model/useFloatingPopoverAnchorRef";

type FloatingPopoverAnchorProps = {
	readonly children: React.ReactNode;
	readonly referenceRef: React.Ref<HTMLElement>;
	readonly getReferenceProps: UseInteractionsReturn["getReferenceProps"];
};

/**
 * Присоединяет floating-поведение к существующему DOM-якорю без новой обёртки.
 * Объединение refs сохраняет в том числе cleanup callback-ref из React 19.
 */
export function FloatingPopoverAnchor({ children, referenceRef, getReferenceProps }: FloatingPopoverAnchorProps) {
	if (!isValidElement<React.HTMLProps<HTMLElement>>(children) || children.type === Fragment) {
		throw new Error("FloatingPopover с asChild ожидает один элемент, передающий ref и props своему DOM-элементу; Fragment недопустим.");
	}

	const ref = useFloatingPopoverAnchorRef(referenceRef, children.props.ref);
	const { "aria-describedby": childDescribedBy, ...childProps } = children.props;
	// Getter объединяет события, но пользовательский aria-describedby заменил бы
	// связь с tooltip. Сохраняем обе связи и не повторяем уже указанные ID.
	const referenceProps = getReferenceProps(childProps);
	const tooltipDescribedBy = referenceProps["aria-describedby"];
	const describedBy = [childDescribedBy, typeof tooltipDescribedBy === "string" ? tooltipDescribedBy : undefined]
		.filter(Boolean)
		.join(" ");
	const describedByIds = [...new Set(describedBy.split(/\s+/).filter(Boolean))].join(" ") || undefined;

	return cloneElement(children, { ...referenceProps, "aria-describedby": describedByIds, ref });
}
