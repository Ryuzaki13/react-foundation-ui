import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./AnimatedLogo.module.scss";

type AnimatedLogoProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
	children: ReactNode;
};

/**
 * Контейнер анимированного логотипа без брендовой SVG-разметки.
 * Host-проект передаёт собственный `svg`, а его визуальные части оборачивает в `AnimatedLogoSegment`.
 */
export function AnimatedLogo({ children, className, ...htmlProps }: AnimatedLogoProps) {
	return (
		<div {...htmlProps} className={cn(styles.logo, className)}>
			{children}
		</div>
	);
}
