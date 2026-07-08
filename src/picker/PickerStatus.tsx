import { ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import uiStyles from "../ui.module.scss";

import styles from "./Picker.module.scss";

interface PickerStatusProps {
	emptyState?: ReactNode;
	loadingState?: ReactNode;
	errorState?: ReactNode;
}

export function PickerStatus({ emptyState, loadingState, errorState }: PickerStatusProps) {
	const content = errorState ?? loadingState ?? emptyState;

	if (content === undefined || content === null) {
		return null;
	}

	return (
		<div className={cn(uiStyles.uiPopupOption, styles.status, errorState !== undefined && styles.statusError)} aria-disabled={true}>
			{content}
		</div>
	);
}
