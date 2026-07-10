import { forwardRef } from "react";

import { FlexItem } from "./FlexItem";

import type { FlexItemProps } from "./types";

export type FlexSpacerProps = Omit<FlexItemProps, "children" | "flex1">;

export const FlexSpacer = forwardRef<HTMLElement, FlexSpacerProps>((props, ref) => <FlexItem {...props} ref={ref} flex1 />);

FlexSpacer.displayName = "FlexSpacer";
