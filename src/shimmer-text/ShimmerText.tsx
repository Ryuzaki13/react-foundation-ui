import { type ComponentProps } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./ShimmerText.module.scss";

export type ShimmerTextProps = Readonly<
	Omit<ComponentProps<"span">, "children"> & {
		children: string;
	}
>;

/**
 * Показывает обычный доступный текст с проходящим по символам световым бликом.
 * Подходит для коротких сообщений о выполняющемся процессе и наследует цвет
 * окружающего текста без собственной семантики загрузки.
 */
export function ShimmerText({ children, className, ...props }: ShimmerTextProps) {
	return (
		<span {...props} className={cn(styles.text, className)}>
			{children}
		</span>
	);
}
