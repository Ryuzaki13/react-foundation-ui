import { PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexCenter } from "../flex";
import { Text, TextColor } from "../text";

interface MessageProps extends PropsWithChildren {
	className?: string;
	color?: TextColor;
	minHeight?: string | number;
	uppercase?: boolean;
}

export const Message: React.FC<MessageProps> = ({ className, children, color = "muted", minHeight, uppercase = true }) => (
	<FlexCenter className={cn("paddingMd textCenter", className)} minHeight={minHeight}>
		<Text as="div" weight="bold" color={color} uppercase={uppercase}>
			{children}
		</Text>
	</FlexCenter>
);
