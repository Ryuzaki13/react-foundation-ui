import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { PolymorphicComponent, PolymorphicComponentBaseProps } from "../polymorphic";

type SeparatorOwnProps<E extends React.ElementType = React.ElementType> = PolymorphicComponentBaseProps<E> & {
	orientation?: "horizontal" | "vertical";
	className?: string;
};

type SeparatorProps<E extends React.ElementType> = SeparatorOwnProps<E> & Omit<React.ComponentPropsWithRef<E>, keyof SeparatorOwnProps>;

export function Separator<E extends React.ElementType>({
	as,
	orientation = "horizontal",
	className,
	role = "separator",
	"aria-orientation": ariaOrientation,
	...props
}: SeparatorProps<E>) {
	const Component = as;

	return (
		<PolymorphicComponent
			as={Component as React.ElementType}
			role={role}
			aria-orientation={role === "separator" ? (ariaOrientation ?? orientation) : undefined}
			className={cn(className, orientation === "horizontal" ? "separator" : "separatorVertical")}
			{...props}
		/>
	);
}
