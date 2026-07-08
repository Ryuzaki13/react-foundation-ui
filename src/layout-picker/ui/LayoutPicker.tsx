import { useRef, useState } from "react";

import { type Placement } from "@floating-ui/react";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CheckIcon } from "lucide-react";

import {
	PickerField,
	PickerPopup,
	PickerTriggerActions,
	PickerTriggerInput,
	usePickerFloatingListbox,
	usePickerTriggerController
} from "../../picker";
import { type UiBaseProps } from "../../types";
import uiStyles from "../../ui.module.scss";
import { DEFAULT_LAYOUT_PICKER_PRESETS, getLayoutCellStyle, getLayoutStyle, type LayoutPickerPreset } from "../lib";

import styles from "./LayoutPicker.module.scss";

export interface LayoutPickerProps extends UiBaseProps<string> {
	id?: string;
	presets?: readonly LayoutPickerPreset[];
	getPresetDisabled?: (preset: LayoutPickerPreset) => boolean;
	ariaLabel?: string;
	className?: string;
	triggerClassName?: string;
	popupClassName?: string;
	placement?: Placement;
}

const DEFAULT_PLACEHOLDER = "Выберите раскладку";

function LayoutPresetPreview({ preset, compact = false }: { preset: LayoutPickerPreset; compact?: boolean }) {
	return (
		<span className={cn(styles.preview, compact && styles.previewCompact)} style={getLayoutStyle(preset)} aria-hidden="true">
			{preset.cells.map((cell) => (
				<span key={`${preset.id}:${cell.id}`} className={styles.previewCell} style={getLayoutCellStyle(cell)} />
			))}
		</span>
	);
}

/**
 * Контрол выбора layout-пресета. Не хранит бизнес-логику содержимого ячеек.
 */
export function LayoutPicker({
	id,
	label,
	description,
	value,
	onChange,
	presets = DEFAULT_LAYOUT_PICKER_PRESETS,
	disabled,
	getPresetDisabled,
	placeholder = DEFAULT_PLACEHOLDER,
	size,
	ariaLabel,
	className,
	triggerClassName,
	popupClassName,
	placement = "bottom-start"
}: LayoutPickerProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [open, setOpen] = useState(false);
	const selectedIndex = presets.findIndex((preset) => preset.id === value);
	const selectedPreset = selectedIndex >= 0 ? presets[selectedIndex] : undefined;
	const previewPreset = selectedPreset ?? presets[0];
	const triggerLabel = selectedPreset?.label ?? placeholder;
	const {
		activeIndex,
		context,
		floatingStyles,
		getFloatingProps,
		setReference,
		setFloating,
		setOptionRef,
		close,
		openList,
		toggleOpen,
		selectOption,
		selectActiveOption,
		handleReferenceKeyDown,
		handleFloatingKeyDown,
		getOptionId,
		getActiveOptionId
	} = usePickerFloatingListbox({
		options: presets,
		selectedIndex,
		open,
		onOpenChange: setOpen,
		getOptionDisabled: getPresetDisabled,
		onSelect: (preset) => onChange(preset.id),
		disabled,
		placement,
		triggerMode: "display"
	});
	const triggerController = usePickerTriggerController({
		mode: "display",
		open,
		currentQuery: "",
		hasDisplayValue: selectedPreset !== undefined,
		inputRef,
		openList,
		close,
		toggleOpen
	});
	const setInputNode = (node: HTMLInputElement | null) => {
		inputRef.current = node;
	};

	return (
		<PickerField
			id={id}
			label={label}
			description={description}
			disabled={disabled}
			placeholder={placeholder}
			size={size}
			className={className}>
			{({ controlId, labelId, describedBy }) => {
				const listId = `${controlId}-listbox`;

				return (
					<>
						<PickerTriggerInput
							ref={setInputNode}
							rootRef={setReference}
							id={controlId}
							type="button"
							disabled={disabled}
							readOnly
							autoComplete="off"
							role="combobox"
							value={triggerLabel}
							aria-haspopup="listbox"
							aria-expanded={open}
							aria-controls={open ? listId : undefined}
							aria-labelledby={labelId}
							aria-describedby={describedBy}
							aria-autocomplete="none"
							aria-activedescendant={open ? getActiveOptionId(listId) : undefined}
							aria-label={!labelId ? (ariaLabel ?? `Выбрать layout. Текущее значение: ${triggerLabel}`) : undefined}
							data-ui="layout-picker-trigger"
							rootClassName={triggerClassName}
							inputClassName={styles.triggerInput}
							overlay={
								<div className={styles.valueOverlay}>
									{previewPreset ? (
										<LayoutPresetPreview preset={previewPreset} compact />
									) : (
										<span className={styles.previewPlaceholder} />
									)}
									<span className={cn(styles.triggerText, !selectedPreset && uiStyles.uiPlaceholder)}>
										{triggerLabel}
									</span>
								</div>
							}
							endAdornment={
								<PickerTriggerActions
									open={open}
									disabled={disabled}
									onToggleMouseDown={triggerController.handleToggleMouseDown}
									onToggleClick={triggerController.handleToggleClick}
									openAriaLabel="Открыть список layout"
									closeAriaLabel="Закрыть список layout"
								/>
							}
							onClick={triggerController.handleTriggerClick}
							onFocus={(event) => {
								triggerController.handleTriggerFocus(event.currentTarget);
							}}
							onKeyDown={(event) => {
								handleReferenceKeyDown(event);

								if (event.defaultPrevented) {
									return;
								}

								triggerController.handleTriggerKeyDown({
									event,
									onActivateWhenOpen: selectActiveOption,
									enableSpaceActivation: true
								});
							}}
						/>

						<PickerPopup
							open={open}
							context={context}
							floatingStyles={floatingStyles}
							listId={listId}
							labelId={labelId}
							descriptionId={describedBy}
							activeOptionId={getActiveOptionId(listId)}
							setFloating={setFloating}
							getFloatingProps={getFloatingProps}
							onKeyDown={handleFloatingKeyDown}
							className={cn(uiStyles.uiPopupOptions, styles.popup, popupClassName)}
							layoutClassName={styles.popupLayout}
							bodyClassName={styles.popupBody}>
							<div className={styles.options}>
								{presets.map((preset, index) => {
									const selected = index === selectedIndex;
									const active = index === activeIndex;
									const presetDisabled = getPresetDisabled?.(preset) ?? false;
									const optionId = getOptionId(listId, index);

									return (
										<button
											key={preset.id}
											id={optionId}
											ref={(node) => setOptionRef(index, node)}
											type="button"
											role="option"
											tabIndex={-1}
											disabled={presetDisabled}
											aria-selected={selected}
											aria-disabled={presetDisabled || undefined}
											aria-label={preset.description ? `${preset.label}. ${preset.description}` : preset.label}
											className={cn(styles.option, selected && styles.optionSelected, active && styles.optionActive)}
											data-ui="layout-picker-option"
											data-selected={selected || undefined}
											onMouseDown={(event) => event.preventDefault()}
											onClick={() => selectOption(preset)}>
											<span className={styles.optionPreviewWrap}>
												<LayoutPresetPreview preset={preset} />
											</span>
											<span className="fontSizeSm">
												<span>{preset.label}</span>
												{preset.description ? <span>{preset.description}</span> : null}
											</span>
											<span className={styles.optionCheck} aria-hidden="true">
												{selected ? <CheckIcon /> : null}
											</span>
										</button>
									);
								})}
							</div>
						</PickerPopup>
					</>
				);
			}}
		</PickerField>
	);
}
