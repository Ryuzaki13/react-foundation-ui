import { useId } from "react";

export interface UseInputFieldIdsOptions {
	id?: string;
	hasLabel?: boolean;
	hasDescription?: boolean;
	hasError?: boolean;
}

export interface InputFieldIds {
	controlId: string;
	labelId?: string;
	descriptionId?: string;
	errorId?: string;
	describedBy?: string;
}

export function useInputFieldIds({ id: externalId, hasLabel, hasDescription, hasError }: UseInputFieldIdsOptions): InputFieldIds {
	const autoId = useId();
	const controlId = externalId ?? autoId;
	const labelId = hasLabel ? `${controlId}-label` : undefined;
	const descriptionId = hasDescription ? `${controlId}-description` : undefined;
	const errorId = hasError ? `${controlId}-error` : undefined;
	const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

	return {
		controlId,
		labelId,
		descriptionId,
		errorId,
		describedBy
	};
}
