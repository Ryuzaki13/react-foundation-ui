import { PropsWithChildren } from "react";

import { Message } from "./Message";

interface NoticeProps extends PropsWithChildren {
	isError?: boolean;
	className?: string;
}

export const Notice: React.FC<NoticeProps> = ({ className, isError, children }) => (
	<Message className={className} color={isError ? "error" : "secondary"}>
		{children}
	</Message>
);
