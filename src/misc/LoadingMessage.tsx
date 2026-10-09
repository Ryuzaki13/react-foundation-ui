import { type AriaAttributes, type AriaRole, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { GridContainer } from "../grid";

import styles from "./LoadingMessage.module.scss";
import { Message } from "./Message";

type LoadingMessageProps = Readonly<{
	className?: string;
	/** Готовый брендовый знак, которым host-проект при необходимости дополняет сообщение о загрузке. */
	logo?: ReactNode;
	text?: string;
	role?: AriaRole;
}> &
	AriaAttributes;

export function LoadingMessage({ className, logo, text, ...ariaAttributes }: LoadingMessageProps) {
	return (
		<Message className={cn(styles.componentLoader, logo ? undefined : "skeletonLine", className)} {...ariaAttributes}>
			<GridContainer as="span" justify="center" justifyContent="center">
				{logo}
				{text || "Загрузка..."}
			</GridContainer>
		</Message>
	);
}
