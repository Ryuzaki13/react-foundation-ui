import { type Ref, useMemo } from "react";

import { resolveProps, useMatchMedia } from "@ryuzaki13/react-foundation-lib/media";

import { PolymorphicComponent } from "../polymorphic";

import { FlexItemLayoutProps, FlexItemProps } from "./types";
import { useFlexItemClasses } from "./useFlexClasses";

const RESPONSIVE_KEYS = [
	"flex0",
	"flex1",
	"grow",
	"shrink",
	"basis",
	"alignSelf",
	"justifySelf"
] as const satisfies readonly (keyof FlexItemLayoutProps)[];

export function FlexItem({
	ref,
	children,
	className = "",
	as,
	style,
	flex0,
	flex1,
	grow,
	shrink,
	basis,
	alignSelf,
	justifySelf,
	...htmlProps
}: FlexItemProps & { ref?: Ref<HTMLElement> }) {
	const { activeBreakpoint } = useMatchMedia();

	const resolvedProps = useMemo(
		() => resolveProps({ flex0, flex1, grow, shrink, basis, alignSelf, justifySelf }, activeBreakpoint, RESPONSIVE_KEYS),
		[activeBreakpoint, alignSelf, basis, flex0, flex1, grow, justifySelf, shrink]
	);

	const flexClasses = useFlexItemClasses(resolvedProps);

	const finalClassName = [flexClasses, className].filter(Boolean).join(" ");
	return (
		<PolymorphicComponent as={as} {...htmlProps} ref={ref} className={finalClassName} style={style}>
			{children}
		</PolymorphicComponent>
	);
}

FlexItem.displayName = "FlexItem";
