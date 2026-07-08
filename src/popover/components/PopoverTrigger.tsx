import React, { cloneElement, useCallback } from "react";

import { usePopoverContext } from "./PopoverContext";

export interface PopoverTriggerProps {
	passive?: true;
	children: React.ReactElement<React.HTMLAttributes<Element> & { ref?: React.Ref<Element> }>;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ passive, children }) => {
	const { open, setOpen, refs } = usePopoverContext();

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (children.props.onClick) {
				children.props.onClick(e);
			}
			if (e.defaultPrevented) {
				return;
			}
			e.preventDefault();
			e.stopPropagation();

			if (passive) return;

			setOpen((v) => !v);
		},
		[children, setOpen, passive]
	);

	return cloneElement(children as React.JSX.Element, {
		ref: refs.setReference,
		"aria-expanded": open,
		onClick: handleClick
	});
};
