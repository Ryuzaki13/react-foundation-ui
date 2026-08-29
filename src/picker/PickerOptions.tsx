import { type HTMLAttributes, type ReactNode, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Separator } from "../separator";

import styles from "./Picker.module.scss";
import { PickerSelectionToolbar } from "./PickerSelectionToolbar";

export type PickerSelectionActions = {
	onSelectAll: () => void;
	onDeselectAll: () => void;
	selectAllButtonRef?: Ref<HTMLButtonElement>;
};

export interface PickerOptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	rootRef?: Ref<HTMLDivElement>;
	children: ReactNode;
	toolbar?: ReactNode | false;
	selectionActions?: PickerSelectionActions;
	layoutClassName?: string;
	bodyClassName?: string;
	scrollable?: boolean;
}

/**
 * Единая оболочка списка опций для picker, listbox и menu. Если переданы
 * selectionActions, но не передан toolbar, компонент показывает стандартные
 * действия выбора и снятия выбора.
 */
export function PickerOptions({
	rootRef,
	children,
	toolbar,
	selectionActions,
	layoutClassName,
	bodyClassName,
	scrollable = true,
	className,
	...props
}: PickerOptionsProps) {
	const resolvedToolbar = toolbar === undefined && selectionActions ? <PickerSelectionToolbar {...selectionActions} /> : toolbar || null;

	return (
		<div
			{...props}
			ref={rootRef}
			className={cn(styles.options, layoutClassName, className)}
			data-ui="picker-options"
			data-has-toolbar={resolvedToolbar ? "true" : undefined}>
			{resolvedToolbar ? (
				<div className={styles.optionsToolbar}>
					{resolvedToolbar}
					<Separator />
				</div>
			) : null}
			<div className={cn(styles.optionsBody, scrollable ? "scrollable" : "overflowHidden", bodyClassName)}>{children}</div>
		</div>
	);
}
