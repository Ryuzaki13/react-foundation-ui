import { type ComponentPropsWithRef, type ReactElement, useRef, useState } from "react";

import { type Placement } from "@floating-ui/react";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { CustomOptionButton, Option } from "../../option";
import { PickerField, PickerPopup, PickerTrigger, usePickerFloatingListbox, usePickerTriggerController } from "../../picker";
import { type UiBaseProps } from "../../types";
import { DEFAULT_LAYOUT_PICKER_PRESETS, type LayoutPickerPreset } from "../lib";

import styles from "./LayoutPicker.module.scss";
import { LayoutPresetPreview } from "./LayoutPresetPreview";

export type LayoutPickerTriggerProps = ComponentPropsWithRef<"button"> & {
	"data-ui": "layout-picker-trigger";
};

export type LayoutPickerTriggerRenderState = Readonly<{
	open: boolean;
	selectedPreset?: LayoutPickerPreset;
	triggerLabel: string;
	/**
	 * Эти props нужно передать в корневую button кастомного trigger, чтобы
	 * сохранить позиционирование popup, клавиатурное управление и ARIA-контракт.
	 */
	triggerProps: LayoutPickerTriggerProps;
}>;

export interface LayoutPickerProps extends UiBaseProps<string> {
	id?: string;
	presets?: readonly LayoutPickerPreset[];
	getPresetDisabled?: (preset: LayoutPickerPreset) => boolean;
	/**
	 * Показывает рядом с превью переданный текст `placeholder`.
	 * По умолчанию текст скрыт, поэтому trigger отображает только иконку раскладки.
	 */
	showPlaceholder?: boolean;
	ariaLabel?: string;
	className?: string;
	triggerClassName?: string;
	popupClassName?: string;
	placement?: Placement;
	/** Заменяет стандартный input-like trigger, не меняя popup со списком пресетов. */
	renderTrigger?: (state: LayoutPickerTriggerRenderState) => ReactElement;
}

const DEFAULT_PLACEHOLDER = "Выберите раскладку";

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
	showPlaceholder = false,
	size,
	ariaLabel,
	className,
	triggerClassName,
	popupClassName,
	placement = "bottom-start",
	renderTrigger
}: LayoutPickerProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [open, setOpen] = useState(false);
	const selectedIndex = presets.findIndex((preset) => preset.id === value);
	const selectedPreset = selectedIndex >= 0 ? presets[selectedIndex] : undefined;
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
		<PickerField id={id} label={label} description={description} disabled={disabled} size={size} className={className}>
			{({ controlId, labelId, describedBy }) => {
				const listId = `${controlId}-listbox`;
				const commonTriggerAria = {
					"aria-haspopup": "listbox" as const,
					"aria-expanded": open,
					"aria-controls": open ? listId : undefined,
					"aria-labelledby": labelId,
					"aria-describedby": describedBy,
					"aria-activedescendant": open ? getActiveOptionId(listId) : undefined,
					"aria-label": !labelId ? (ariaLabel ?? `Выбрать layout. Текущее значение: ${triggerLabel}`) : undefined
				};
				const customTrigger = renderTrigger?.({
					open,
					selectedPreset,
					triggerLabel,
					triggerProps: {
						ref: setReference,
						id: controlId,
						type: "button",
						disabled,
						role: "combobox",
						...commonTriggerAria,
						"data-ui": "layout-picker-trigger",
						className: triggerClassName,
						onClick: () => {
							if (!disabled) toggleOpen();
						},
						onKeyDown: (event) => {
							handleReferenceKeyDown(event);

							if (event.defaultPrevented) return;

							triggerController.handleTriggerKeyDown({
								event,
								onActivateWhenOpen: selectActiveOption,
								enableSpaceActivation: true
							});
						}
					}
				});

				return (
					<>
						{customTrigger ?? (
							<PickerTrigger
								ref={setInputNode}
								rootRef={setReference}
								id={controlId}
								type="button"
								disabled={disabled}
								open={open}
								optionCount={presets.length}
								label={label}
								placeholder={placeholder}
								readOnly
								autoComplete="off"
								role="combobox"
								value={triggerLabel}
								selectedValue={
									selectedPreset ? (
										<>
											<LayoutPresetPreview preset={selectedPreset} compact />
											{showPlaceholder ? (
												<span className={styles.triggerText} data-ui="layout-picker-selected-label">
													{selectedPreset.label}
												</span>
											) : null}
										</>
									) : undefined
								}
								hasSelection={selectedPreset !== undefined}
								showSelectedValue={selectedPreset !== undefined}
								onToggleMouseDown={triggerController.handleToggleMouseDown}
								onToggleClick={triggerController.handleToggleClick}
								openAriaLabel="Открыть список layout"
								closeAriaLabel="Закрыть список layout"
								{...commonTriggerAria}
								aria-autocomplete="none"
								data-ui="layout-picker-trigger"
								rootClassName={triggerClassName}
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
						)}

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
							className={cn(styles.popup, popupClassName)}
							layoutClassName={styles.popupLayout}
							bodyClassName={styles.popupBody}>
							<div className={styles.options}>
								{presets.map((preset, index) => {
									const selected = index === selectedIndex;
									const active = index === activeIndex;
									const presetDisabled = getPresetDisabled?.(preset) ?? false;
									const optionId = getOptionId(listId, index);

									return (
										<Option
											key={preset.id}
											id={optionId}
											ref={(node) => setOptionRef(index, node)}
											role="option"
											aria-selected={selected}
											aria-disabled={presetDisabled || undefined}
											aria-label={preset.description ? `${preset.label}. ${preset.description}` : preset.label}
											className={styles.option}
											active={active}
											selected={selected}
											disabled={presetDisabled}
											data-ui="layout-picker-option"
											data-selected={selected || undefined}>
											<CustomOptionButton
												tabIndex={-1}
												disabled={presetDisabled}

												onMouseDown={(event) => event.preventDefault()}
												onClick={() => selectOption(preset)}>
												<span className={styles.optionPreviewWrap}>
													<LayoutPresetPreview preset={preset} />
												</span>
											</CustomOptionButton>
										</Option>
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
