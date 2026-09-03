import { AriaRole, PropsWithChildren } from "react";

import { Message } from "./Message";

interface NoticeProps extends PropsWithChildren {
	isError?: boolean;
	className?: string;
	role?: AriaRole;
}

export function Notice({ className, isError, role, children }: NoticeProps) {
	return (
		<Message className={className} color={isError ? "error" : "secondary"} role={role}>
			{children}
		</Message>
	);
}
