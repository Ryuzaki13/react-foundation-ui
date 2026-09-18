import { type AriaAttributes, type AriaRole, type PropsWithChildren } from "react";

import { Message } from "./Message";

type NoticeProps = PropsWithChildren<
	Readonly<{
		isError?: boolean;
		className?: string;
		role?: AriaRole;
	}>
> &
	AriaAttributes;

export function Notice({ className, isError, role, children, ...ariaAttributes }: NoticeProps) {
	return (
		<Message {...ariaAttributes} className={className} color={isError ? "error" : "secondary"} role={role}>
			{children}
		</Message>
	);
}
