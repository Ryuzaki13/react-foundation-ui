import { useCallback, useMemo, useRef, useState } from "react";

import {
	extractPickerTextContent,
	PickerField,
	PickerPopup,
	PickerTrigger,
	usePickerDefaultFilter,
	usePickerFloatingListbox,
	usePickerQuery,
	usePickerSelectionLifecycle,
	usePickerTriggerController
} from "../../picker";
import { Separator } from "../../separator";
import { formatMultiSelectOptionCount } from "../lib/formatMultiSelectOptionCount";
import { materializeMultiSelectOptions } from "../lib/materializeMultiSelectOptions";
import { areMultiSelectSelectionsEqual } from "../lib/multiSelectSelection";

import { type MultiSelectProps } from "./MultiSelect";
import styles from "./MultiSelect.module.scss";
import { MultiSelectOptionList } from "./MultiSelectOptionList";
import { MultiSelectOptionsWrapper } from "./MultiSelectOptionsWrapper";
import { type MultiSelectOptionDisableContext } from "./multiSelectTypes";

type MultiSelectCoreProps<TOption> = MultiSelectProps<TOption> &
	Readonly<{
		/** Сохраняет опубликованную ссылочную семантику только для legacy MultiSelect. */
		preserveOptionArrayReference?: boolean;
	}>;

/**
 * Единая generic-реализация множественного выбора. Публичные компоненты только
 * адаптируют свои контракты к этим selector-функциям, поэтому focus и a11y
 * поведение не расходятся между новым и legacy API.
 */
export function MultiSelectCore<TOption>({
	ref,
	options,
	value,
	onChange,
	getOptionKey,
	getOptionLabel,
	getOptionCode,
	getOptionGroup,
	getOptionSearchText,
	label,
	description,
	placeholder,
	size,
	query,
	defaultQuery,
	highlightQuery,
	onQuery,
	defaultFilter = true,
	onOpen,
	onClose,
	getOptionDisabled,
	disabled,
	error,
	isLoading,
	renderToken,
	renderToolbar,
	renderOption,
	preserveOptionArrayReference = false
}: MultiSelectCoreProps<TOption>) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [open, setOpen] = useState(false);
	const triggerMode = "search-multi";
	const committedSelectedOptions = useMemo(
		() => materializeMultiSelectOptions(value, preserveOptionArrayReference),
		[preserveOptionArrayReference, value]
	);
	const committedSelectedKeys = useMemo(
		() => new Set(committedSelectedOptions.map(getOptionKey)),
		[committedSelectedOptions, getOptionKey]
	);
	const availableOptions = useMemo(
		() => options.filter((option) => !committedSelectedKeys.has(getOptionKey(option))),
		[committedSelectedKeys, getOptionKey, options]
	);
	const {
		query: currentQuery,
		setQuery,
		resetQueryOnClose
	} = usePickerQuery({
		query,
		defaultQuery,
		onQuery,
		triggerMode
	});
	const handleOpenChange = (nextOpen: boolean) => {
		if (open && !nextOpen && resetQueryOnClose) {
			setQuery("");
		}

		setOpen(nextOpen);
	};
	const getSearchText = useCallback(
		(option: TOption) =>
			getOptionSearchText?.(option) ??
			[getOptionLabel(option), getOptionCode?.(option), extractPickerTextContent(getOptionGroup?.(option)?.label)].filter(
				(part): part is string => Boolean(part)
			),
		[getOptionCode, getOptionGroup, getOptionLabel, getOptionSearchText]
	);
	const filteredCommittedSelectedOptions = usePickerDefaultFilter({
		options: committedSelectedOptions,
		query: currentQuery,
		enabled: defaultFilter,
		getSearchText
	});
	const filteredAvailableOptions = usePickerDefaultFilter({
		options: availableOptions,
		query: currentQuery,
		enabled: defaultFilter,
		getSearchText
	});
	const visibleOptions = useMemo(
		() => [...filteredCommittedSelectedOptions, ...filteredAvailableOptions],
		[filteredAvailableOptions, filteredCommittedSelectedOptions]
	);
	const selectedIndex = filteredCommittedSelectedOptions.length > 0 ? 0 : -1;
	const compareSelections = useCallback(
		(left: TOption[], right: TOption[]) => areMultiSelectSelectionsEqual(left, right, getOptionKey),
		[getOptionKey]
	);
	const {
		draftValue: draftSelectedOptions,
		setDraftValue: setDraftSelectedOptions,
		prepareOpen
	} = usePickerSelectionLifecycle({
		value: committedSelectedOptions,
		open,
		onCommit: onChange,
		onOpen,
		onClose,
		isEqual: compareSelections
	});
	const selectedKeys = useMemo(() => new Set(draftSelectedOptions.map(getOptionKey)), [draftSelectedOptions, getOptionKey]);
	const optionDisableContext = useMemo<MultiSelectOptionDisableContext<TOption>>(
		() => ({
			selectedOptions: draftSelectedOptions,
			committedSelectedOptions,
			selectedKeys,
			open
		}),
		[committedSelectedOptions, draftSelectedOptions, open, selectedKeys]
	);
	const isOptionDisabled = useCallback(
		(option: TOption) => getOptionDisabled?.(option, optionDisableContext) ?? false,
		[getOptionDisabled, optionDisableContext]
	);
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
		handleReferenceKeyDown,
		handleFloatingKeyDown,
		getOptionId,
		getActiveOptionId
	} = usePickerFloatingListbox({
		options: visibleOptions,
		selectedIndex,
		open,
		onOpenChange: handleOpenChange,
		onSelect: undefined,
		disabled,
		getOptionDisabled: isOptionDisabled,
		closeOnSelect: false,
		allowOpenWithoutOptions: true,
		triggerMode
	});

	const currentHighlightQuery = highlightQuery ?? currentQuery;
	const toggleDraftSelection = (option: TOption) => {
		const optionKey = getOptionKey(option);

		setDraftSelectedOptions((currentOptions) => {
			const isSelected = currentOptions.some((selectedOption) => getOptionKey(selectedOption) === optionKey);

			if (isSelected) {
				return currentOptions.filter((selectedOption) => getOptionKey(selectedOption) !== optionKey);
			}

			if (isOptionDisabled(option)) {
				return currentOptions;
			}

			return [...currentOptions, option];
		});
	};

	const setInputNode = useCallback(
		(node: HTMLInputElement | null) => {
			inputRef.current = node;

			if (typeof ref === "function") {
				ref(node);
				return;
			}

			if (ref) {
				ref.current = node;
			}
		},
		[ref]
	);

	const clearSelection = () => {
		setDraftSelectedOptions([]);

		if (!open) {
			onChange([]);
		}
	};

	const selectAll = () => {
		setDraftSelectedOptions((currentOptions) => {
			const nextOptions = [...currentOptions];
			const nextSelectedKeys = new Set(currentOptions.map(getOptionKey));

			for (const option of visibleOptions) {
				const optionKey = getOptionKey(option);

				if (!nextSelectedKeys.has(optionKey) && !isOptionDisabled(option)) {
					nextSelectedKeys.add(optionKey);
					nextOptions.push(option);
				}
			}

			return nextOptions;
		});
	};

	const deselectAll = () => {
		setDraftSelectedOptions([]);
	};

	const selectOnlyOption = (option: TOption) => {
		if (isOptionDisabled(option)) {
			return;
		}

		setDraftSelectedOptions([option]);
		close();
	};

	const currentSelectedOptions = open ? draftSelectedOptions : committedSelectedOptions;
	const hasSelectedOptions = currentSelectedOptions.length > 0;
	const renderContext = {
		selectedOptions: currentSelectedOptions,
		committedSelectedOptions,
		availableOptions: filteredAvailableOptions,
		query: currentQuery,
		open,
		clearSelection,
		selectAll,
		deselectAll
	};
	const defaultTokenNode =
		currentSelectedOptions.length > 1
			? formatMultiSelectOptionCount(currentSelectedOptions.length)
			: currentSelectedOptions.length === 1
				? getOptionLabel(currentSelectedOptions[0])
				: undefined;
	const tokenNode = renderToken === undefined ? defaultTokenNode : typeof renderToken === "function" ? renderToken(renderContext) : null;
	const toolbarNode = typeof renderToolbar === "function" ? renderToolbar(renderContext) : renderToolbar;
	const renderDefaultOption = useCallback(
		(option: TOption) => ({ text: getOptionLabel(option), code: getOptionCode?.(option) }),
		[getOptionCode, getOptionLabel]
	);
	const optionRenderer = renderOption ?? renderDefaultOption;
	const selectedEntries = filteredCommittedSelectedOptions.map((option, index) => ({ option, index }));
	const availableEntries = filteredAvailableOptions.map((option, index) => ({
		option,
		index: index + selectedEntries.length
	}));
	const isNoData = !isLoading && !error && visibleOptions.length === 0;
	const triggerController = usePickerTriggerController({
		mode: triggerMode,
		open,
		currentQuery,
		hasDisplayValue: false,
		inputRef,
		setQuery,
		openList,
		close,
		toggleOpen,
		onBeforeOpen: () => {
			if (!open) {
				prepareOpen();
			}
		}
	});

	return (
		<PickerField label={label} description={description} disabled={disabled} size={size} className={styles.multiSelect}>
			{({ controlId, labelId, describedBy }) => {
				const listId = `${controlId}-grid`;

				return (
					<>
						<PickerTrigger
							ref={setInputNode}
							rootRef={setReference}
							id={controlId}
							type="text"
							role="combobox"
							autoComplete="off"
							isLoading={isLoading}
							disabled={disabled}
							open={open}
							optionCount={options.length}
							label={label}
							placeholder={placeholder}
							placeholderFallback="Выберите значения"
							value={currentQuery}
							selectedValue={tokenNode}
							hasSelection={hasSelectedOptions}
							showSelectedValue={hasSelectedOptions && currentQuery.length === 0}
							clearable
							onClear={clearSelection}
							clearAriaLabel="Очистить все"
							onToggleMouseDown={triggerController.handleToggleMouseDown}
							onToggleClick={triggerController.handleToggleClick}
							aria-labelledby={labelId}
							aria-describedby={describedBy}
							aria-haspopup="grid"
							aria-expanded={open}
							aria-controls={open ? listId : undefined}
							aria-autocomplete="list"
							aria-activedescendant={open ? getActiveOptionId(listId) : undefined}
							rootClassName="flex alignItemsCenter"
							onChange={(event) => {
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

								if (open && event.ctrlKey && event.key === " ") {
									event.preventDefault();
									const activeOption = visibleOptions[activeIndex];
									if (activeIndex >= 0 && activeIndex < visibleOptions.length) {
										toggleDraftSelection(activeOption);
									}
									return;
								}

								triggerController.handleTriggerKeyDown({
									event,
									onActivateWhenOpen: () => {
										const activeOption = visibleOptions[activeIndex];
										if (activeIndex >= 0 && activeIndex < visibleOptions.length) {
											selectOnlyOption(activeOption);
										}
									},
									enableClosedArrowDownOpen: true,
									suppressClosedArrowUp: true
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
							activeOptionId={open ? getActiveOptionId(listId) : undefined}
							ariaMultiselectable
							popupRole="grid"
							setFloating={setFloating}
							getFloatingProps={getFloatingProps}
							onKeyDown={handleFloatingKeyDown}
							initialFocus={-1}
							returnFocus={false}
							tabIndex={-1}
							toolbar={toolbarNode}
							selectionActions={
								renderToolbar === undefined ? { onSelectAll: selectAll, onDeselectAll: deselectAll } : undefined
							}>
							<MultiSelectOptionsWrapper isNoData={isNoData} error={error}>
								<div role="presentation" className="scrollable overscroll h100">
									<MultiSelectOptionList
										entries={selectedEntries}
										sectionId={`${listId}-selected`}
										listId={listId}
										activeIndex={activeIndex}
										selectedKeys={selectedKeys}
										query={currentQuery}
										highlightQuery={currentHighlightQuery}
										getOptionKey={getOptionKey}
										getOptionGroup={getOptionGroup}
										getOptionDisabled={isOptionDisabled}
										getOptionId={getOptionId}
										setOptionRef={setOptionRef}
										toggleOption={toggleDraftSelection}
										selectOnlyOption={selectOnlyOption}
										renderOption={optionRenderer}
									/>

									{selectedEntries.length > 0 && availableEntries.length > 0 && (
										<Separator aria-hidden="true" className="marginBlockSm" />
									)}

									<MultiSelectOptionList
										entries={availableEntries}
										sectionId={`${listId}-available`}
										listId={listId}
										activeIndex={activeIndex}
										selectedKeys={selectedKeys}
										query={currentQuery}
										highlightQuery={currentHighlightQuery}
										getOptionKey={getOptionKey}
										getOptionGroup={getOptionGroup}
										getOptionDisabled={isOptionDisabled}
										getOptionId={getOptionId}
										setOptionRef={setOptionRef}
										toggleOption={toggleDraftSelection}
										selectOnlyOption={selectOnlyOption}
										renderOption={optionRenderer}
									/>
								</div>
							</MultiSelectOptionsWrapper>
						</PickerPopup>
					</>
				);
			}}
		</PickerField>
	);
}
