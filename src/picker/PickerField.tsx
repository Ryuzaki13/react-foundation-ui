import { InputType } from "@ryuzaki13/react-foundation-lib/types";

import { InputUI } from "../input";
import { useInputFieldIds } from "../input/lib/useInputFieldIds";

import { PickerFieldProps } from "./types";

export function PickerField<TValue extends InputType>({
	id,
	label,
	description,
	disabled,
	size,
	className,
	error,
	children
}: PickerFieldProps<TValue>) {
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		id,
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			size={size}
			className={className}
			error={error}
			controlId={controlId}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			{children({ controlId, labelId, descriptionId, errorId, describedBy })}
		</InputUI>
	);
}
