import { type AriaAttributes, type PropsWithChildren, type ReactNode } from "react";

import { FlexContainer } from "../flex";

type AlertWithActionsProps = PropsWithChildren &
	AriaAttributes &
	Readonly<{
		message: ReactNode;
	}>;

export function AlertWithActions({ message, children, ...ariaAttributes }: AlertWithActionsProps) {
	return (
		<FlexContainer as="p" role="alert" align="center" justify="center" gap="sm" wrap {...ariaAttributes}>
			<span className="statusError fontBold textCenter">{message}</span>
			{children}
		</FlexContainer>
	);
}
