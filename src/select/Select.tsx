import { type CSSProperties, Fragment, ReactNode, useCallback, useMemo, useRef, useState } from "react";

import { Placement } from "@floating-ui/react";
import { InputType } from "@ryuzaki13/react-foundation-lib/types";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CheckIcon, XIcon } from "lucide-react";

import {
	extractPickerTextContent,
	PickerField,
	PickerPopup,
	PickerStatus,
	PickerTriggerActions,
	PickerTriggerInput,
	usePickerDefaultFilter,
	usePickerFloatingListbox,
	usePickerQuery,
	usePickerTriggerController
} from "../picker";
import { ChangeHandler, UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import { getOptionSearchText } from "./lib";
import { createSelectOptionSections } from "./lib/createSelectOptionSections";
import styles from "./Select.module.scss";
import { type SelectOptionGroup, type SelectOptionKey } from "./SelectOptionGroup";

export { type SelectOptionGroup, type SelectOptionKey } from "./SelectOptionGroup";

export type SelectOptionState = {
	active: boolean;
	selected: boolean;
	disabled: boolean;
};

type SelectSharedProps<TOption extends InputType> = Omit<UiBaseProps<TOption, TOption | undefined>, "onChange"> & {
	options: readonly TOption[];
	getOptionKey: (option: TOption) => SelectOptionKey;
	getOptionLabel: (option: TOption) => ReactNode;
	getOptionCode?: (option: TOption) => ReactNode;
	getOptionDisabled?: (option: TOption) => boolean;
	getOptionAriaLabel?: (option: TOption) => string;
	getOptionGroup?: (option: TOption) => SelectOptionGroup | undefined;
	getOptionClassName?: (option: TOption, state: SelectOptionState) => string | undefined;
	renderOption?: (option: TOption, state: SelectOptionState) => ReactNode;
	renderValue?: (option: TOption) => ReactNode;
	className?: string;
	buttonClassName?: string;
	optionsClassName?: string;
	optionsMaxWidth?: CSSProperties["maxWidth"];
	optionsContentClassName?: string;
	searchable?: boolean;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	defaultFilter?: boolean;
	renderPopupHeader?: ReactNode;
	emptyState?: ReactNode;
	loadingState?: ReactNode;
	errorState?: ReactNode;
	placement?: Placement;
};

type SelectChangeValue<TOption extends InputType, TClearable extends boolean | undefined> = true extends TClearable
	? TOption | undefined
	: TOption;

export type SelectProps<TOption extends InputType, TClearable extends boolean | undefined = false> = SelectSharedProps<TOption> & {
	clearable?: TClearable;
	onChange: ChangeHandler<SelectChangeValue<TOption, TClearable>>;
};

/**
 * Выпадающий список выбора значения из набора опций. Подходит для форм, фильтров и простых справочников.
 */
export function Select<TOption extends InputType, TClearable extends boolean | undefined = false>(props: SelectProps<TOption, TClearable>) {
	const {
		label,
		description,
		disabled,
		placeholder,
		size,
		options,
		value,
		onChange,
		getOptionKey,
		getOptionLabel,
		getOptionCode,
		getOptionDisabled,
		getOptionAriaLabel,
		getOptionGroup,
		getOptionClassName,
		renderOption,
		renderValue,
		className,
		buttonClassName,
		optionsClassName,
		optionsMaxWidth,
		optionsContentClassName,
		searchable = false,
		defaultFilter = true,
		query,
		defaultQuery,
		onQuery,
		renderPopupHeader,
		emptyState,
		loadingState,
		errorState,
		placement = "bottom-start",
		clearable = false
	} = props;
	const emitChange = onChange as ChangeHandler<TOption | undefined>;

	const inputRef = useRef<HTMLInputElement | null>(null);
	const [open, setOpen] = useState(false);
	const triggerMode = searchable ? "search-single" : "display";
	const selectedKey = value === undefined ? undefined : getOptionKey(value);
	const selectedOption =
		selectedKey === undefined ? undefined : (options.find((option) => getOptionKey(option) === selectedKey) ?? value);
	const { query: currentQuery, setQuery } = usePickerQuery({
		open,
		query,
		defaultQuery,
		onQuery,
		triggerMode
	});
	const getSearchText = useCallback(
		(option: TOption) =>
			getOptionSearchText({
				option,
				getOptionLabel,
				getOptionCode,
				getOptionGroup
			}),
		[getOptionCode, getOptionGroup, getOptionLabel]
	);
	const visibleOptions = usePickerDefaultFilter({
		options,
		query: currentQuery,
		enabled: searchable && defaultFilter,
		getSearchText
	});
	const optionSections = useMemo(
		() => (getOptionGroup ? createSelectOptionSections(visibleOptions, getOptionGroup) : undefined),
		[getOptionGroup, visibleOptions]
	);
	const selectedIndex = selectedKey === undefined ? -1 : visibleOptions.findIndex((option) => getOptionKey(option) === selectedKey);
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
		options: visibleOptions,
		selectedIndex,
		open,
		onOpenChange: setOpen,
		getOptionDisabled,
		onSelect: emitChange,
		disabled,
		placement,
		triggerMode
	});

	const hasOptions = visibleOptions.length > 0;
	const labelContent = selectedOption !== undefined ? getOptionLabel(selectedOption) : undefined;
	const displayContent = selectedOption !== undefined ? (renderValue ? renderValue(selectedOption) : labelContent) : undefined;
	const labelText = extractPickerTextContent(labelContent);
	const codeText = selectedOption !== undefined ? extractPickerTextContent(getOptionCode?.(selectedOption)) : undefined;
	const displayText =
		extractPickerTextContent(displayContent) ?? labelText ?? codeText ?? (selectedKey !== undefined ? String(selectedKey) : "");
	const showSearchValue = searchable && (open || currentQuery.length > 0);
	const inputValue = showSearchValue ? currentQuery : selectedOption !== undefined ? displayText : "";
	const showDisplayOverlay =
		selectedOption !== undefined &&
		displayContent !== undefined &&
		extractPickerTextContent(displayContent) === undefined &&
		!showSearchValue;
	const triggerController = usePickerTriggerController({
		mode: triggerMode,
		open,
		currentQuery,
		hasDisplayValue: selectedOption !== undefined,
		inputRef,
		setQuery,
		openList,
		close,
		toggleOpen
	});
	const setInputNode = (node: HTMLInputElement | null) => {
		inputRef.current = node;
	};
	const handleClear = () => {
		if (clearable) {
			emitChange(undefined);
		}

		setQuery("");
		close();
	};
	const renderOptionNode = (listId: string, option: TOption, index: number) => {
		const optionKey = getOptionKey(option);
		const selected = selectedKey !== undefined && optionKey === selectedKey;
		const active = index === activeIndex;
		const optionDisabled = getOptionDisabled?.(option) ?? false;
		const optionState = { active, selected, disabled: optionDisabled };

		return (
			<div
				key={optionKey}
				id={getOptionId(listId, index)}
				ref={(node) => setOptionRef(index, node)}
				role="option"
				aria-selected={selected}
				aria-disabled={optionDisabled || undefined}
				aria-label={getOptionAriaLabel?.(option)}
				className={cn(
					uiStyles.uiPopupOption,
					optionDisabled && uiStyles.disabled,
					active && uiStyles.uiPopupOptionActive,
					selected && uiStyles.selected,
					getOptionClassName?.(option, optionState)
				)}
				onClick={() => selectOption(option)}>
				{renderOption ? (
					renderOption(option, optionState)
				) : (
					<>
						{selected ? <CheckIcon className={uiStyles.uiPopupOptionIcon} /> : <span className={uiStyles.uiPopupOptionIcon} />}
						<div className={uiStyles.uiOptionText}>{getOptionLabel(option)}</div>
						{getOptionCode && <div className={uiStyles.uiOptionCode}>{getOptionCode(option)}</div>}
					</>
				)}
			</div>
		);
	};

	return (
		<PickerField
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
							type="text"
							disabled={disabled}
							readOnly={!searchable}
							autoComplete="off"
							role="combobox"
							value={inputValue}
							placeholder={selectedOption === undefined || showSearchValue ? placeholder : undefined}
							aria-labelledby={labelId}
							aria-describedby={describedBy}
							aria-haspopup="listbox"
							aria-expanded={open}
							aria-controls={open ? listId : undefined}
							aria-autocomplete={searchable ? "list" : "none"}
							aria-activedescendant={open ? getActiveOptionId(listId) : undefined}
							inputClassName={cn(showDisplayOverlay && styles.inputWithOverlay, buttonClassName, "textOverflow")}
							overlay={showDisplayOverlay ? <div className={styles.valueOverlay}>{displayContent}</div> : undefined}
							endAdornment={
								<PickerTriggerActions
									open={open}
									disabled={disabled}
									onToggleMouseDown={triggerController.handleToggleMouseDown}
									onToggleClick={triggerController.handleToggleClick}>
									{clearable && selectedOption !== undefined && !disabled ? (
										<button
											type="button"
											className={uiStyles.uiClearButton}
											data-ui="select-clear-button"
											data-action="clear-select"
											onMouseDown={(event) => {
												event.preventDefault();
												event.stopPropagation();
											}}
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												handleClear();
											}}
											aria-label="Очистить выбор">
											<XIcon />
										</button>
									) : null}
								</PickerTriggerActions>
							}
							onChange={(event) => {
								if (!searchable) {
									return;
								}

								triggerController.handleTriggerInputChange(event.target.value);
							}}
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
									enableSpaceActivation: !searchable
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
							activeOptionId={hasOptions ? getActiveOptionId(listId) : undefined}
							setFloating={setFloating}
							getFloatingProps={getFloatingProps}
							onKeyDown={handleFloatingKeyDown}
							className={cn(uiStyles.uiPopupOptions, optionsClassName)}
							maxWidth={optionsMaxWidth}
							header={renderPopupHeader}>
							<div className={cn(optionsContentClassName, "h100 scrollable")}>
								{hasOptions ? (
									optionSections ? (
										optionSections.map((section, sectionIndex) => {
											const groupLabelId = section.group ? `${listId}-group-${sectionIndex}` : undefined;
											const optionNodes = section.items.map(({ option, index }) =>
												renderOptionNode(listId, option, index)
											);

											return section.group ? (
												<div
													key={`group-${String(section.group.key)}-${sectionIndex}`}
													role="group"
													aria-labelledby={groupLabelId}>
													<div id={groupLabelId} className={uiStyles.uiPopupGroupLabel}>
														{section.group.label}
													</div>
													{optionNodes}
												</div>
											) : (
												<Fragment key={`options-${sectionIndex}`}>{optionNodes}</Fragment>
											);
										})
									) : (
										visibleOptions.map((option, index) => renderOptionNode(listId, option, index))
									)
								) : (
									<PickerStatus emptyState={emptyState} loadingState={loadingState} errorState={errorState} />
								)}
							</div>
						</PickerPopup>
					</>
				);
			}}
		</PickerField>
	);
}
