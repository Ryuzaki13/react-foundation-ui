import { ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Picker.module.scss";

interface PickerStatusProps {
	emptyState?: ReactNode;
	// loadingState?: ReactNode;
	errorState?: ReactNode;
}

export function PickerStatus({ emptyState, errorState }: PickerStatusProps) {
	const content = errorState ?? emptyState;

	if (content === undefined || content === null) {
		return null;
	}

	return <div className={cn(styles.status, errorState !== undefined && styles.statusError)}>{content}</div>;
}
