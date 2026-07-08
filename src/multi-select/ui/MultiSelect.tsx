import React, { forwardRef, type PropsWithChildren, useCallback, useMemo, useRef, useState } from "react";

import { XIcon } from "lucide-react";

import type { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { CheckBox } from "../../check-box";
import {
	PickerField,
	PickerPopup,
	PickerStatus,
	PickerTriggerActions,
	PickerTriggerInput,
	usePickerDefaultFilter,
	usePickerFloatingListbox,
	usePickerQuery,
	usePickerSelectionLifecycle,
	usePickerTriggerController
} from "../../picker";
import { Separator } from "../../separator";
import { type UiBaseProps } from "../../types";
import uiStyles from "../../ui.module.scss";

import {
	createDefaultMultiSelectItemRenderer,
	createDefaultMultiSelectTokenRenderer,
	renderDefaultMultiSelectToolbar,
	resolveMultiSelectTextKey
} from "./defaultRenderers";
import styles from "./MultiSelect.module.scss";
import { MultiSelectOptionSkeleton } from "./MultiSelectOptionSkeleton";

interface MultiSelectOptionsProps extends PropsWithChildren {
	isNoData?: boolean;
	isLoading?: boolean;
	error?: string;
}

function MultiSelectOptionsWrapper({ isNoData, isLoading, error, children }: MultiSelectOptionsProps) {
	if (isNoData) return <PickerStatus emptyState={<MultiSelectOptionSkeleton text="Нет данных" />} />;
	if (isLoading) return <PickerStatus loadingState={<MultiSelectOptionSkeleton text="Загрузка..." />} />;
	if (error) return <PickerStatus errorState={<MultiSelectOptionSkeleton isError text="Ошибка загрузки" />} />;

	return <>{children}</>;
}

export interface MultiSelectItemState {
	selected: boolean;
	active: boolean;
	disabled: boolean;
	query: string;
	highlightQuery: string;
}

export interface MultiSelectRenderContext {
	selectedItems: CollectionItem[];
	committedSelectedItems: CollectionItem[];
	availableItems: CollectionItem[];
	query: string;
	open: boolean;
	clearSelection: () => void;
	selectAll: () => void;
	deselectAll: () => void;
}

export interface MultiSelectOptionDisableContext {
	selectedItems: CollectionItem[];
	committedSelectedItems: CollectionItem[];
	selectedKeys: ReadonlySet<string>;
	open: boolean;
}

type MultiSelectOptionalRenderer<TContext> = ((context: TContext) => React.ReactNode) | null | false;

interface MultiSelectRenderers {
	renderToken?: MultiSelectOptionalRenderer<MultiSelectRenderContext>;
	renderToolbar?: MultiSelectOptionalRenderer<MultiSelectRenderContext>;
	renderItem?: (item: CollectionItem, state: MultiSelectItemState) => React.ReactNode;
}

export interface MultiSelectProps<TOption extends Record<string, string> = CollectionItem>
	extends MultiSelectRenderers, UiBaseProps<TOption[]> {
	codeKey: string;
	textKey?: string;
	hideCode?: boolean;
	query?: string;
	defaultQuery?: string;
	highlightQuery?: string;
	onQuery?: (value: string) => void;
	defaultFilter?: boolean;
	items: TOption[];
	getOptionDisabled?: (item: TOption, context: MultiSelectOptionDisableContext) => boolean;
	onOpen?: () => void;
	onClose?: (value: TOption[]) => void;
	error?: string;
	isLoading?: boolean;
}

const fallback: CollectionItem[] = [];

function getItemKey(item: CollectionItem, codeKey: string) {
	return item[codeKey];
}

function getItemSearchParts(item: CollectionItem, codeKey: string, textKey: string) {
	return Array.from(new Set([item[textKey], item[codeKey], ...Object.values(item)]));
}

function areSelectionsEqual(left: CollectionItem[], right: CollectionItem[], codeKey: string) {
	if (left.length !== right.length) {
		return false;
	}

	const rightKeys = new Set(right.map((item) => getItemKey(item, codeKey)));

	return left.every((item) => rightKeys.has(getItemKey(item, codeKey)));
}

interface MultiSelectOptionEntry {
	item: CollectionItem;
	index: number;
}

interface MultiSelectOptionGroupProps {
	entries: MultiSelectOptionEntry[];
	listId: string;
	activeIndex: number;
	selectedKeys: Set<string>;
	codeKey: string;
	query: string;
	highlightQuery: string;
	getOptionDisabled?: (item: CollectionItem) => boolean;
	getOptionId: (listId: string, index: number) => string;
	setOptionRef: (index: number, node: HTMLElement | null) => void;
	toggleOption: (item: CollectionItem) => void;
	selectOnlyOption: (item: CollectionItem) => void;
	renderItem: (item: CollectionItem, state: MultiSelectItemState) => React.ReactNode;
}

function MultiSelectOptionGroup({
	entries,
	listId,
	activeIndex,
	selectedKeys,
	codeKey,
	query,
	highlightQuery,
	getOptionDisabled,
	getOptionId,
	setOptionRef,
	toggleOption,
	selectOnlyOption,
	renderItem
}: MultiSelectOptionGroupProps) {
	return entries.map(({ item, index }) => {
		const active = index === activeIndex;
		const selected = selectedKeys.has(getItemKey(item, codeKey));
		const optionDisabled = getOptionDisabled?.(item) ?? false;

		return (
			<div
				key={`${getItemKey(item, codeKey)}-${index}`}
				id={getOptionId(listId, index)}
				ref={(node) => setOptionRef(index, node)}
				role="option"
				aria-selected={selected}
				aria-disabled={optionDisabled || undefined}
				className={cn(
					uiStyles.uiSelectOption,
					optionDisabled && uiStyles.disabled,
					selected && uiStyles.selected,
					active && uiStyles.uiPopupOptionActive
				)}
				onMouseDown={(event) => {
					event.preventDefault();
				}}>
				<div
					onClick={(event) => {
						event.stopPropagation();
					}}>
					<CheckBox
						value={selected}
						disabled={optionDisabled}
						onChange={() => {
							if (!optionDisabled) {
								toggleOption(item);
							}
						}}
						onClick={(event) => {
							event.stopPropagation();
						}}
						onMouseDown={(event) => {
							event.stopPropagation();
						}}
					/>
				</div>
				<div
					className="overflowHidden"
					onClick={() => {
						if (!optionDisabled) {
							selectOnlyOption(item);
						}
					}}>
					{renderItem(item, { selected, active, disabled: optionDisabled, query, highlightQuery })}
				</div>
			</div>
		);
	});
}

/**
 * Поле множественного выбора с внутренним черновиком значений и подтверждением выбора при закрытии списка.
 * Подходит как для самостоятельного использования, так и как базовый слой для OData-оберток.
 */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(
	(
		{
			codeKey,
			textKey,
			hideCode,
			items,
			value,
			onChange,
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
			renderItem
		},
		ref
	) => {
		const inputRef = useRef<HTMLInputElement | null>(null);
		const [open, setOpen] = useState(false);
		const triggerMode = "search-multi";
		const committedSelectedItems = value ?? fallback;
		const committedSelectedKeys = useMemo(
			() => new Set(committedSelectedItems.map((item) => getItemKey(item, codeKey))),
			[codeKey, committedSelectedItems]
		);
		const availableItems = useMemo(
			() => items.filter((item) => !committedSelectedKeys.has(getItemKey(item, codeKey))),
			[codeKey, committedSelectedKeys, items]
		);
		const resolvedTextKey = useMemo(
			() => resolveMultiSelectTextKey([...committedSelectedItems, ...items], codeKey, textKey),
			[codeKey, committedSelectedItems, items, textKey]
		);
		const { query: currentQuery, setQuery } = usePickerQuery({
			open,
			query,
			defaultQuery,
			onQuery,
			triggerMode
		});
		const filteredCommittedSelectedItems = usePickerDefaultFilter({
			options: committedSelectedItems,
			query: currentQuery,
			enabled: defaultFilter,
			getSearchText: (item) => getItemSearchParts(item, codeKey, resolvedTextKey)
		});
		const filteredAvailableItems = usePickerDefaultFilter({
			options: availableItems,
			query: currentQuery,
			enabled: defaultFilter,
			getSearchText: (item) => getItemSearchParts(item, codeKey, resolvedTextKey)
		});
		const visibleOptions = useMemo(
			() => [...filteredCommittedSelectedItems, ...filteredAvailableItems],
			[filteredAvailableItems, filteredCommittedSelectedItems]
		);
		const selectedIndex = filteredCommittedSelectedItems.length > 0 ? 0 : -1;
		const {
			draftValue: draftSelectedItems,
			setDraftValue: setDraftSelectedItems,
			prepareOpen
		} = usePickerSelectionLifecycle({
			value: committedSelectedItems,
			open,
			onCommit: onChange,
			onOpen,
			onClose,
			isEqual: (left, right) => areSelectionsEqual(left, right, codeKey)
		});
		const selectedKeys = useMemo(
			() => new Set(draftSelectedItems.map((item) => getItemKey(item, codeKey))),
			[codeKey, draftSelectedItems]
		);
		const optionDisableContext = useMemo<MultiSelectOptionDisableContext>(
			() => ({
				selectedItems: draftSelectedItems,
				committedSelectedItems,
				selectedKeys,
				open
			}),
			[committedSelectedItems, draftSelectedItems, open, selectedKeys]
		);
		const isOptionDisabled = useCallback(
			(item: CollectionItem) => getOptionDisabled?.(item, optionDisableContext) ?? false,
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
			onSelect: undefined,
			disabled,
			getOptionDisabled: isOptionDisabled,
			closeOnSelect: false,
			allowOpenWithoutOptions: true,
			triggerMode
		});

		const currentHighlightQuery = highlightQuery ?? currentQuery;
		const toggleDraftSelection = (item: CollectionItem) => {
			const itemKey = getItemKey(item, codeKey);

			setDraftSelectedItems((currentItems) => {
				const isSelected = currentItems.some((selectedItem) => getItemKey(selectedItem, codeKey) === itemKey);

				if (isSelected) {
					return currentItems.filter((selectedItem) => getItemKey(selectedItem, codeKey) !== itemKey);
				}

				if (isOptionDisabled(item)) {
					return currentItems;
				}

				return [...currentItems, item];
			});
		};

		const setInputNode = (node: HTMLInputElement | null) => {
			inputRef.current = node;

			if (typeof ref === "function") {
				ref(node);
				return;
			}

			if (ref) {
				ref.current = node;
			}
		};

		const clearSelection = () => {
			setDraftSelectedItems([]);

			if (!open) {
				onChange([]);
			}
		};

		const selectAll = () => {
			setDraftSelectedItems((currentItems) => {
				const nextItems = [...currentItems];
				const selectedKeys = new Set(currentItems.map((item) => getItemKey(item, codeKey)));

				for (const item of visibleOptions) {
					const itemKey = getItemKey(item, codeKey);

					if (!selectedKeys.has(itemKey) && !isOptionDisabled(item)) {
						selectedKeys.add(itemKey);
						nextItems.push(item);
					}
				}

				return nextItems;
			});
		};

		const deselectAll = () => {
			setDraftSelectedItems([]);
		};

		const selectOnlyOption = (item: CollectionItem) => {
			if (isOptionDisabled(item)) {
				return;
			}

			setDraftSelectedItems([item]);
			close();
		};

		const currentSelectedItems = open ? draftSelectedItems : committedSelectedItems;
		const hasSelectedItems = currentSelectedItems.length > 0;
		const renderContext: MultiSelectRenderContext = {
			selectedItems: currentSelectedItems,
			committedSelectedItems,
			availableItems: filteredAvailableItems,
			query: currentQuery,
			open,
			clearSelection,
			selectAll,
			deselectAll
		};
		const tokenRenderer =
			renderToken === undefined ? createDefaultMultiSelectTokenRenderer({ codeKey, textKey: resolvedTextKey }) : renderToken;
		const toolbarRenderer = renderToolbar === undefined ? renderDefaultMultiSelectToolbar : renderToolbar;
		const itemRenderer =
			renderItem ??
			createDefaultMultiSelectItemRenderer({
				codeKey,
				textKey: resolvedTextKey,
				hideCode
			});
		const tokenNode = typeof tokenRenderer === "function" ? tokenRenderer(renderContext) : null;
		const toolbarNode = typeof toolbarRenderer === "function" ? toolbarRenderer(renderContext) : null;
		// const hasToken = tokenNode !== null && tokenNode !== undefined;
		const selectedEntries = filteredCommittedSelectedItems.map((item, index) => ({ item, index }));
		const itemEntries = filteredAvailableItems.map((item, index) => ({ item, index: index + selectedEntries.length }));
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
			<PickerField
				label={label}
				description={description}
				disabled={disabled}
				placeholder={placeholder}
				size={size}
				className={styles.multiSelect}>
				{({ controlId, labelId, describedBy }) => {
					const listId = `${controlId}-listbox`;

					return (
						<>
							<PickerTriggerInput
								ref={setInputNode}
								rootRef={setReference}
								id={controlId}
								type="text"
								role="combobox"
								autoComplete="off"
								disabled={disabled}
								value={currentQuery}
								placeholder={hasSelectedItems ? undefined : placeholder}
								aria-labelledby={labelId}
								aria-describedby={describedBy}
								aria-haspopup="listbox"
								aria-expanded={open}
								aria-controls={open ? listId : undefined}
								aria-autocomplete="list"
								aria-activedescendant={open ? getActiveOptionId(listId) : undefined}
								rootClassName="flex alignItemsCenter"
								endAdornment={
									<PickerTriggerActions
										open={open}
										disabled={disabled}
										onToggleMouseDown={triggerController.handleToggleMouseDown}
										onToggleClick={triggerController.handleToggleClick}>
										{tokenNode}

										<button
											type="button"
											disabled={!hasSelectedItems}
											className={uiStyles.uiClearButton}
											data-ui="multi-select-clear-button"
											data-action="clear-multi-select"
											onClick={clearSelection}
											aria-label="Очистить все">
											<XIcon />
										</button>
									</PickerTriggerActions>
								}
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

									triggerController.handleTriggerKeyDown({
										event,
										onActivateWhenOpen: () => {
											if (activeIndex >= 0) {
												const activeItem = visibleOptions[activeIndex];
												if (activeItem) {
													toggleDraftSelection(activeItem);
													return;
												}
											}

											selectActiveOption();
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
								setFloating={setFloating}
								getFloatingProps={getFloatingProps}
								onKeyDown={handleFloatingKeyDown}
								initialFocus={-1}
								returnFocus={false}
								tabIndex={-1}
								className={uiStyles.uiPopupOptions}
								header={toolbarNode}>
								<MultiSelectOptionsWrapper isNoData={isNoData} isLoading={isLoading} error={error}>
									<div className="scrollable h100">
										<MultiSelectOptionGroup
											entries={selectedEntries}
											listId={listId}
											activeIndex={activeIndex}
											selectedKeys={selectedKeys}
											codeKey={codeKey}
											query={currentQuery}
											highlightQuery={currentHighlightQuery}
											getOptionDisabled={isOptionDisabled}
											getOptionId={getOptionId}
											setOptionRef={setOptionRef}
											toggleOption={toggleDraftSelection}
											selectOnlyOption={selectOnlyOption}
											renderItem={itemRenderer}
										/>

										{selectedEntries.length > 0 && availableItems.length > 0 && <Separator className="marginBlockSm" />}

										<MultiSelectOptionGroup
											entries={itemEntries}
											listId={listId}
											activeIndex={activeIndex}
											selectedKeys={selectedKeys}
											codeKey={codeKey}
											query={currentQuery}
											highlightQuery={currentHighlightQuery}
											getOptionDisabled={isOptionDisabled}
											getOptionId={getOptionId}
											setOptionRef={setOptionRef}
											toggleOption={toggleDraftSelection}
											selectOnlyOption={selectOnlyOption}
											renderItem={itemRenderer}
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
);

MultiSelect.displayName = "MultiSelect";
