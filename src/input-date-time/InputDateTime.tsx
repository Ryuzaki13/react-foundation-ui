import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { InputClearButton, InputControl, InputUI, useInputFieldIds } from "../input";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import styles from "./InputDateTime.module.scss";
import { useMaskedSegments } from "./useMaskedSegments";

interface InputDateTimeBaseProps extends UiBaseProps<Date, Date | undefined> {
	mask: string;

	className?: string;

	error?: string;
	onClearError?: () => void;
	onClear?: () => void;

	"aria-label"?: string;
}

function InputDateTimeBase({
	mask,
	value,
	onChange,
	label,
	description,
	disabled,
	size,
	className,
	error,
	onClearError,
	onClear,
	"aria-label": ariaLabel
}: InputDateTimeBaseProps) {
	const {
		segments,
		segmentValues,
		registerRef,
		handleInput,
		handleKeyDown,
		handleFocus,
		handleContainerFocus,
		handleContainerBlur,
		focusFirstEmpty
	} = useMaskedSegments({ mask, value, onChange, onClearError, disabled });
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			className={className}
			size={size}
			error={error}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			<InputControl
				endAdornment={onClear ? <InputClearButton onClick={onClear} disabled={disabled} /> : undefined}
				endAdornmentWidth={onClear ? "var(--control-height)" : undefined}>
				{({ controlClassName }) => (
					<div
						id={controlId}
						className={cn(uiStyles.uiInputControlFake, controlClassName)}
						data-invalid={error ? "" : undefined}
						data-disabled={disabled || undefined}
						role="group"
						aria-invalid={!!error || undefined}
						aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
						aria-labelledby={ariaLabel ? undefined : labelId}
						aria-describedby={describedBy}
						onFocus={handleContainerFocus}
						onBlur={handleContainerBlur}
						onClick={(e) => {
							if (e.target === e.currentTarget) focusFirstEmpty();
						}}>
						{segments.map((segment, index) => {
							if (segment.kind === "literal") {
								return (
									<span key={index} className={styles.separator} data-disabled={disabled || undefined}>
										{segment.text}
									</span>
								);
							}

							return (
								<input
									key={index}
									ref={registerRef(index)}
									type="text"
									inputMode="numeric"
									className={styles.segmentInput}
									style={{ width: `${segment.length + 0.5}ch` }}
									value={segmentValues.get(index) ?? ""}
									placeholder={segment.placeholder}
									maxLength={segment.length}
									disabled={disabled}
									aria-label={segment.type}
									autoComplete="off"
									onChange={handleInput(index)}
									onKeyDown={handleKeyDown(index)}
									onFocus={handleFocus()}
								/>
							);
						})}
					</div>
				)}
			</InputControl>
		</InputUI>
	);
}

export type InputDateProps = Omit<InputDateTimeBaseProps, "mask"> & { mask?: string };
export type InputTimeProps = Omit<InputDateTimeBaseProps, "mask"> & { mask?: string };
export type InputDateTimeProps = Omit<InputDateTimeBaseProps, "mask"> & { mask?: string };

export function InputDate({ mask = "YYYY.MM.DD", ...props }: InputDateProps) {
	return <InputDateTimeBase mask={mask} {...props} />;
}

export function InputTime({ mask = "hh:mm", ...props }: InputTimeProps) {
	return <InputDateTimeBase mask={mask} {...props} />;
}

export function InputDateTime({ mask = "YYYY.MM.DD hh:mm", ...props }: InputDateTimeProps) {
	return <InputDateTimeBase mask={mask} {...props} />;
}
