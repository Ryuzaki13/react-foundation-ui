import { AriaRole } from "react";

import { Message } from "./Message";

interface NoDataProps {
	className?: string;
	text?: string;
	minHeight?: string | number;
	role?: AriaRole;
}

export function NoData({ className, text, role, minHeight = "5em" }: NoDataProps) {
	return (
		<Message className={className} color="muted" minHeight={minHeight} role={role}>
			{text || "Нет данных"}
		</Message>
	);
}
