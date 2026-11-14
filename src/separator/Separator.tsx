import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { PolymorphicComponent, PolymorphicComponentBaseProps } from "../polymorphic";

const SEPARATOR_ORIENTATION_HORIZONTAL = "horizontal";
const SEPARATOR_ROLE = "separator";

type SeparatorOwnProps<E extends React.ElementType = React.ElementType> = PolymorphicComponentBaseProps<E> & {
	orientation?: typeof SEPARATOR_ORIENTATION_HORIZONTAL | "vertical";
	className?: string;
};

type SeparatorProps<E extends React.ElementType> = SeparatorOwnProps<E> & Omit<React.ComponentPropsWithRef<E>, keyof SeparatorOwnProps>;

export function Separator<E extends React.ElementType>({
	as,
	orientation = SEPARATOR_ORIENTATION_HORIZONTAL,
	className,
	role = SEPARATOR_ROLE,
	"aria-orientation": ariaOrientation,
	...props
}: SeparatorProps<E>) {
	const Component = as;

	return (
		<PolymorphicComponent
			as={Component as React.ElementType}
			role={role}
			aria-orientation={role === SEPARATOR_ROLE ? (ariaOrientation ?? orientation) : undefined}
			className={cn(className, orientation === SEPARATOR_ORIENTATION_HORIZONTAL ? "separator" : "separatorVertical")}
			{...props}
		/>
	);
}
