import React from "react";

import { State } from "@ryuzaki13/react-foundation-lib/types";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { PolymorphicComponent, PolymorphicComponentBaseProps } from "../polymorphic";

import styles from "./State.module.scss";

type StateWrapperOwnProps<E extends React.ElementType = React.ElementType> = PolymorphicComponentBaseProps<E> & {
	state?: State;
	className?: string;
};

type StateWrapperProps<E extends React.ElementType> = StateWrapperOwnProps<E> &
	Omit<React.ComponentPropsWithRef<E>, keyof StateWrapperOwnProps>;

export function StateWrapper<E extends React.ElementType>({ as, state, className, ...props }: StateWrapperProps<E>) {
	const status = state?.toLowerCase() ?? "none";
	const statusClass = styles[status as keyof typeof styles];
	const isStatused = status && status !== "none";

	const Component = as || "div";

	return (
		<PolymorphicComponent
			as={Component as React.ElementType}
			className={cn(styles.stateWrapper, isStatused && styles.status, statusClass, className)}
			{...props}
		/>
	);
}
