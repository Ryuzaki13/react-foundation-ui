import { type CSSProperties, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./FloatingWindows.module.scss";
import { useFloatingWindowsBounds } from "./model/useFloatingWindowsBounds";
import { useFloatingWindowsStore } from "./model/useFloatingWindowsStore";

type FloatingWindowsBoundaryProps = Readonly<{ children: ReactNode; className?: string; style?: CSSProperties }>;

/** Измеряемый containing block не перехватывает события страницы за пределами самих окон. */
export function FloatingWindowsBoundary({ children, className, style }: FloatingWindowsBoundaryProps) {
	const store = useFloatingWindowsStore();
	const ref = useFloatingWindowsBounds(store);
	return (
		<div ref={ref} className={cn(styles.boundary, className)} style={style} data-floating-windows="">
			{children}
		</div>
	);
}
