import { type ButtonHTMLAttributes, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

export type CustomOptionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & { ref?: Ref<HTMLButtonElement> };

export function CustomOptionButton({ ref, ...props }: CustomOptionButtonProps) {
	return <button {...props} ref={ref} type="button" className={cn(uiStyles.uiOptionButton, props.className)} />;
}
