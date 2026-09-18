import { type AriaAttributes, type AriaRole, type PropsWithChildren } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexCenter } from "../flex";
import { Text, type TextColor } from "../text";

type MessageProps = PropsWithChildren<
	Readonly<{
		className?: string;
		color?: TextColor;
		minHeight?: string | number;
		uppercase?: boolean;
		role?: AriaRole;
	}>
> &
	AriaAttributes;

export function Message({ className, children, color = "muted", role, minHeight, uppercase = true, ...ariaAttributes }: MessageProps) {
	return (
		<FlexCenter className={cn("paddingMd textCenter", className)} minHeight={minHeight}>
			<Text {...ariaAttributes} as="p" weight="bold" color={color} uppercase={uppercase} role={role}>
				{children}
			</Text>
		</FlexCenter>
	);
}
