import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronRightIcon, XIcon } from "lucide-react";

import { FlexContainer } from "../../flex";
import { useInputFieldIds } from "../../input";
import inputStyles from "../../input/Input.module.scss";
import { UiBaseProps } from "../../types";
import uiStyles from "../../ui.module.scss";

interface AdvancedSearchSelectUIProps extends Omit<UiBaseProps<string[]>, "value" | "onChange"> {
	token: string | undefined;
	onOpen: () => void;
	onClear: () => void;
}

export const AdvancedSearchSelectUI = ({
	label,
	description,
	disabled,
	size,
	placeholder = "Выбрать",
	token,
	onOpen,
	onClear
}: AdvancedSearchSelectUIProps) => {
	const { controlId, labelId, descriptionId } = useInputFieldIds({
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description
	});
	const hasToken = Boolean(token);

	return (
		<div aria-disabled={disabled || undefined} className={cn(uiStyles.uiElement, uiStyles.uiSizable, size && uiStyles[size])}>
			{label && (
				<label id={labelId} htmlFor={controlId} className={uiStyles.uiLabel}>
					{label}
				</label>
			)}
			{description && (
				<p id={descriptionId} className={uiStyles.uiDescription}>
					{description}
				</p>
			)}

			<div className={uiStyles.uiInputContainer}>
				<div className={uiStyles.uiInputWithToggle}>
					{!hasToken && (
						<FlexContainer align="center" className="h100">
							<div className={uiStyles.uiPlaceholder}>{placeholder}</div>
						</FlexContainer>
					)}
				</div>

				<div className={inputStyles.controlEndAdornment}>
					<div className={uiStyles.uiToggleButtonContainer}>
						<div className="flexEllipsis" style={{ maxWidth: "100%" }}>
							{token}
						</div>

						<button
							type="button"
							disabled={!token}
							className={uiStyles.uiClearButton}
							onClick={onClear}
							aria-label="Очистить все">
							<XIcon />
						</button>

						<div className={uiStyles.uiButtonSeparator} />

						<button type="button" onClick={onOpen} className={uiStyles.uiToggleButton}>
							<ChevronRightIcon className={uiStyles.uiToggleIcon} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
