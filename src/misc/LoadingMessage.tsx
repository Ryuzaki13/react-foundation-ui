import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { AnimatedLogo } from "./AnimatedLogo";
import styles from "./LoadingMessage.module.scss";
import { Message } from "./Message";

interface LoadingMessageProps {
	className?: string;
	text?: string;
	withLogo?: boolean;
}

export function LoadingMessage({ className, text, withLogo }: LoadingMessageProps) {
	return (
		<Message className={cn(styles.componentLoader, withLogo ? "" : "skeletonLine", className)}>
			{withLogo && <AnimatedLogo />}

			{text || "Загрузка..."}
		</Message>
	);
}
