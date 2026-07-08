import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { PolymorphicComponent, PolymorphicComponentBaseProps } from "../polymorphic";

type SkeletonLineOwnProps<E extends React.ElementType = React.ElementType> = PolymorphicComponentBaseProps<E> & {
	className?: string;
};

type SkeletonLineProps<E extends React.ElementType> = SkeletonLineOwnProps<E> &
	Omit<React.ComponentPropsWithRef<E>, keyof SkeletonLineOwnProps>;

export const SkeletonLine = <E extends React.ElementType>({ as, className, ...props }: SkeletonLineProps<E>) => {
	const Component = as || "div";

	return (
		<PolymorphicComponent
			as={Component as React.ElementType}
			className={cn("skeletonLine colorTransparent radiusSm", className)}
			{...props}
		/>
	);
};
