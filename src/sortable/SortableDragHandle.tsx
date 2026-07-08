import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { GripIcon } from "lucide-react";

import { SortableHandle } from "./Sortable";
import styles from "./SortableDragHandle.module.scss";

type SortableDragHandleBaseProps = {
	children?: ReactNode;
	className?: string;
	disabled?: boolean;
	icon?: ReactNode;
};

type SortableDragHandleDivProps = SortableDragHandleBaseProps &
	Omit<ComponentPropsWithoutRef<"div">, keyof SortableDragHandleBaseProps | "children"> & {
		as?: "div";
	};

type SortableDragHandleButtonProps = SortableDragHandleBaseProps &
	Omit<ComponentPropsWithoutRef<"button">, keyof SortableDragHandleBaseProps | "children" | "type"> & {
		as: "button";
		type?: "button" | "submit" | "reset";
	};

export type SortableDragHandleProps = SortableDragHandleDivProps | SortableDragHandleButtonProps;

function renderHandleContent(children: ReactNode, icon: ReactNode) {
	return children ?? icon;
}

function resolveIconOnlyAriaLabel(children: ReactNode, ariaLabel: string | undefined, title: string | undefined) {
	return children == null ? (ariaLabel ?? title) : ariaLabel;
}

export function SortableDragHandle(props: SortableDragHandleProps) {
	if (props.as === "button") {
		const { as, children, className, disabled = false, icon = <GripIcon aria-hidden="true" />, type = "button", ...restProps } = props;
		const ariaLabel = resolveIconOnlyAriaLabel(children, restProps["aria-label"], restProps.title);

		return (
			<SortableHandle<"button">
				{...restProps}
				as={as}
				type={type}
				disabled={disabled}
				aria-label={ariaLabel}
				className={cn(styles.dragHandle, className)}>
				{renderHandleContent(children, icon)}
			</SortableHandle>
		);
	}

	const { as, children, className, disabled = false, icon = <GripIcon aria-hidden="true" />, ...restProps } = props;
	const ariaLabel = resolveIconOnlyAriaLabel(children, restProps["aria-label"], restProps.title);

	return (
		<SortableHandle<"div">
			{...restProps}
			as={as}
			disabled={disabled}
			aria-label={ariaLabel}
			className={cn(styles.dragHandle, className)}>
			{renderHandleContent(children, icon)}
		</SortableHandle>
	);
}
