import { type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./LoadingMessage.module.scss";
import { Message } from "./Message";

type LoadingMessageProps = {
	className?: string;
	/** Готовый брендовый знак, которым host-проект при необходимости дополняет сообщение о загрузке. */
	logo?: ReactNode;
	text?: string;
};

export function LoadingMessage({ className, logo, text }: LoadingMessageProps) {
	return (
		<Message className={cn(styles.componentLoader, logo ? undefined : "skeletonLine", className)}>
			{logo}

			{text || "Загрузка..."}
		</Message>
	);
}
