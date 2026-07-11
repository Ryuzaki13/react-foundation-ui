import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./AnimatedLogo.module.scss";

type AnimatedLogoSegmentProps = Omit<ComponentPropsWithoutRef<"g">, "children"> & {
	children: ReactNode;
	order: number;
};

/**
 * Анимирует одну смысловую часть host-логотипа и сдвигает её pulse относительно предыдущих частей.
 * `order` задаётся с нуля в визуальной последовательности сегментов и преобразуется в шаг задержки 200 мс.
 */
export function AnimatedLogoSegment({ children, className, order, style, ...svgGroupProps }: AnimatedLogoSegmentProps) {
	return (
		<g {...svgGroupProps} className={cn(styles.segment, className)} style={{ ...style, animationDelay: `${order * 200}ms` }}>
			{children}
		</g>
	);
}
