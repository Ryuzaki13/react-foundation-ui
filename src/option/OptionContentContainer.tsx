import { type HTMLAttributes } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

/**
 * Неинтерактивная оболочка содержимого option/treeitem. Она сохраняет геометрию
 * OptionButton, когда клавиатурная модель принадлежит родительскому composite.
 */
export function OptionContentContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div {...props} className={cn(uiStyles.uiOptionButton, className)} />;
}
