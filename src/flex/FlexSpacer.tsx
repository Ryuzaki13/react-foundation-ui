import { type Ref } from "react";

import { FlexItem } from "./FlexItem";

import type { FlexItemProps } from "./types";

export type FlexSpacerProps = Omit<FlexItemProps, "children" | "flex1">;

export function FlexSpacer({ ref, ...props }: FlexSpacerProps & { ref?: Ref<HTMLElement> }) {
	return <FlexItem {...props} ref={ref} flex1 />;
}

FlexSpacer.displayName = "FlexSpacer";
