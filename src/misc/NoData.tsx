import { type AriaAttributes, type AriaRole } from "react";

import { Message } from "./Message";

type NoDataProps = Readonly<{
	className?: string;
	text?: string;
	minHeight?: string | number;
	role?: AriaRole;
}> &
	AriaAttributes;

export function NoData({ className, text, role, minHeight = "5em", ...ariaAttributes }: NoDataProps) {
	return (
		<Message {...ariaAttributes} className={className} color="muted" minHeight={minHeight} role={role}>
			{text || "Нет данных"}
		</Message>
	);
}
