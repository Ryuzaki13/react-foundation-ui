import React, { createElement } from "react";

export interface PolymorphicComponentBaseProps<E extends React.ElementType = React.ElementType> {
	as?: E;
}

export type PolymorphicComponentProps<E extends React.ElementType> = PolymorphicComponentBaseProps<E> &
	Omit<React.ComponentPropsWithRef<E>, keyof PolymorphicComponentBaseProps>;

export const PolymorphicComponent = <E extends React.ElementType = "div">({ as, children, ...props }: PolymorphicComponentProps<E>) => {
	const Component = as || "div";

	// return <Component {...props}>{children}</Component>;
	return createElement(Component, { ...props }, children);
};
