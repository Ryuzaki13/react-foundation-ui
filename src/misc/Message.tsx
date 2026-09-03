import { AriaRole, PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexCenter } from "../flex";
import { Text, TextColor } from "../text";

interface MessageProps extends PropsWithChildren {
	className?: string;
	color?: TextColor;
	minHeight?: string | number;
	uppercase?: boolean;
	role?: AriaRole;
}

export function Message({ className, children, color = "muted", role, minHeight, uppercase = true }: MessageProps) {
	return (
		<FlexCenter className={cn("paddingMd textCenter", className)} minHeight={minHeight}>
			<Text as="p" weight="bold" color={color} uppercase={uppercase} role={role}>
				{children}
			</Text>
		</FlexCenter>
	);
}
