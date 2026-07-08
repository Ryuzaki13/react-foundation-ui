import { ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./IconWrapper.module.scss";

interface IconWrapperProps {
	children: ReactNode;
	className?: string;
}

export function IconWrapper({ className, children }: IconWrapperProps) {
	return <div className={cn(styles.wrapper, className)}>{children}</div>;
}
