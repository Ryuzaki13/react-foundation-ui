import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { PolymorphicComponent, PolymorphicComponentBaseProps } from "../polymorphic";

type SeparatorOwnProps<E extends React.ElementType = React.ElementType> = PolymorphicComponentBaseProps<E> & {
	orientation?: "horizontal" | "vertical";
	className?: string;
};

type SeparatorProps<E extends React.ElementType> = SeparatorOwnProps<E> & Omit<React.ComponentPropsWithRef<E>, keyof SeparatorOwnProps>;

export const Separator = <E extends React.ElementType>({ as, orientation = "horizontal", className, ...props }: SeparatorProps<E>) => {
	const Component = as;

	return (
		<PolymorphicComponent
			as={Component as React.ElementType}
			aria-orientation={orientation}
			className={cn(className, orientation === "horizontal" ? "separator" : "separatorVertical")}
			{...props}
		/>
	);
};
