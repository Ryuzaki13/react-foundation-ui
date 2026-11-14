import { type CSSProperties, type KeyboardEvent, ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { type FloatingListboxSizeResolver } from "@ryuzaki13/react-foundation-lib/hooks";
import { cn, findFirstEnabledIndex, findLastEnabledIndex, findNextEnabledIndex } from "@ryuzaki13/react-foundation-lib/utils";

import { InputText } from "../input";
import { Option } from "../option";
import {
	PickerField,
	PickerPopup,
	PickerSelectionToolbar,
	PickerStatus,
	PickerTrigger,
	usePickerFloatingListbox,
	usePickerQuery,
	usePickerTriggerController
} from "../picker";
import {
	PICKER_TRIGGER_MODE_DISPLAY,
	PICKER_TRIGGER_MODE_SEARCH_MULTI,
	PICKER_TRIGGER_MODE_SEARCH_SINGLE
} from "../picker/model/pickerTriggerModes";
import { UiBaseProps } from "../types";

import { buildTreeColumnsLayoutDescriptor } from "./model/buildTreeColumnsLayoutDescriptor";
import { resolveBalancedTreeColumnsLayout } from "./model/resolveBalancedTreeColumnsLayout";
import {
	createTreeNodeIndex,
	filterTreeNodes,
	flattenVisibleTreeNodes,
	getConfiguredTreeExpandedIds,
	getSelectionExpandedIds,
	isTreeNodeSelected,
	type TreeNodeIndex,
	TreeVisibleEntry
} from "./model/treeUtils";
import { TreeNodeContent } from "./TreeNodeContent";
import styles from "./TreeSelect.module.scss";
import {
	TREE_OPTIONS_LAYOUT_TREE,
	TREE_OPTIONS_LAYOUT_COLUMNS,
	TREE_SELECTION_MODE_SINGLE,
	TREE_SELECTION_MODE_MULTI,
	TREE_TRIGGER_MODE_DISPLAY,
	TREE_TRIGGER_MODE_SEARCH
} from "./treeSelectConstants";
import { TreeMultiSelectOptionsLayout, TreeSelectNode } from "./types";

const TREE_KEY_NEXT_NODE = "ArrowDown";
const TREE_KEY_FIRST_NODE = "Home";
const TREE_KEY_TAB = "Tab";

type TreePickerBulkActions = {
	onSelectAll: () => void;
	onDeselectAll: () => void;
};

type TreePickerBaseProps = Omit<UiBaseProps<never>, "value" | "onChange"> & {
	nodes: readonly TreeSelectNode[];
	selectedIds: Set<string>;
	partialIds: Set<string>;
	selectionMode: typeof TREE_SELECTION_MODE_SINGLE | typeof TREE_SELECTION_MODE_MULTI;
	optionsLayout?: TreeMultiSelectOptionsLayout;
	defaultExpandedCodeKeys?: readonly string[];
	/** Узлы, которые текущий multi-select contract не может безопасно сериализовать. */
	unavailableNodeIds?: ReadonlySet<string>;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	bulkActions?: TreePickerBulkActions;
	triggerMode?: typeof TREE_TRIGGER_MODE_DISPLAY | typeof TREE_TRIGGER_MODE_SEARCH;
	selectedSummary?: ReactNode;
	selectedSummaryText?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	/** Основное действие OptionButton выбирает узел и завершает текущий выбор. */
	onNodeActivate: (node: TreeSelectNode, selectionScopeIndex?: TreeNodeIndex) => void;
	/** Независимый checkbox меняет черновик, не закрывая popup. */
	onNodeToggleSelection?: (node: TreeSelectNode, selectionScopeIndex?: TreeNodeIndex) => void;
	onClearSelection?: () => void;
	isLoading?: boolean;
	error?: string;
	fieldError?: string;
	required?: boolean;
};

export function TreePickerBase({
	label,
	description,
	disabled,
	placeholder,
	size,
	nodes,
	selectedIds,
	partialIds,
	selectionMode,
	optionsLayout = TREE_OPTIONS_LAYOUT_TREE,
	defaultExpandedCodeKeys,
	unavailableNodeIds,
	open: controlledOpen,
	onOpenChange,
	bulkActions,
	triggerMode = TREE_TRIGGER_MODE_DISPLAY,
	selectedSummary,
	selectedSummaryText,
	query,
	defaultQuery,
	onQuery,
	onNodeActivate,
	onNodeToggleSelection,
	onClearSelection,
	isLoading,
	error,
	fieldError,
	required
}: TreePickerBaseProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const selectAllButtonRef = useRef<HTMLButtonElement | null>(null);
	const optionRefs = useRef<Array<HTMLElement | null>>([]);
	/** Явный owner open-state позволяет сбрасывать query непосредственно в close-событии. */
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	/** Синхронизирует видимый active-state со строкой, в которую вошёл фокус. */
	const [focusedNodeId, setFocusedNodeId] = useState<string>();
	const isOpenControlled = controlledOpen !== undefined;
	const open = isOpenControlled ? controlledOpen : uncontrolledOpen;
	const [manualExpansionById, setManualExpansionById] = useState<ReadonlyMap<string, boolean>>(() => new Map());
	const resolvedTriggerMode =
		triggerMode === TREE_TRIGGER_MODE_SEARCH
			? selectionMode === TREE_SELECTION_MODE_MULTI
				? PICKER_TRIGGER_MODE_SEARCH_MULTI
				: PICKER_TRIGGER_MODE_SEARCH_SINGLE
			: PICKER_TRIGGER_MODE_DISPLAY;
	const treeIndex = useMemo(() => createTreeNodeIndex(nodes), [nodes]);
	const defaultExpandedCodeKeySet = useMemo(() => new Set(defaultExpandedCodeKeys), [defaultExpandedCodeKeys]);
	const {
		query: currentQuery,
		setQuery,
		resetQueryOnClose
	} = usePickerQuery({
		query,
		defaultQuery,
		onQuery,
		triggerMode: resolvedTriggerMode
	});
	const handleOpenChange = (nextOpen: boolean) => {
		if (open && !nextOpen && resetQueryOnClose) {
			setQuery("");
		}
		if (!nextOpen) {
			setFocusedNodeId(undefined);
		}

		if (!isOpenControlled) {
			setUncontrolledOpen(nextOpen);
		}

		onOpenChange?.(nextOpen);
	};
	const { nodes: filteredNodes, expandedIds: searchExpandedIds } = useMemo(
		() => filterTreeNodes(nodes, currentQuery),
		[nodes, currentQuery]
	);
	const filteredTreeIndex = useMemo(() => createTreeNodeIndex(filteredNodes), [filteredNodes]);
	const selectionScopeIndex = currentQuery.trim().length > 0 ? filteredTreeIndex : undefined;
	const selectedExpandedIds = useMemo(() => getSelectionExpandedIds(selectedIds, treeIndex), [selectedIds, treeIndex]);
	const configuredExpandedIds = useMemo(
		() => getConfiguredTreeExpandedIds(treeIndex, defaultExpandedCodeKeySet, manualExpansionById),
		[defaultExpandedCodeKeySet, manualExpansionById, treeIndex]
	);
	const allExpandedIds = useMemo(
		() => new Set([...treeIndex.childrenById].filter(([, childIds]) => childIds.length > 0).map(([nodeId]) => nodeId)),
		[treeIndex]
	);
	const resolvedExpandedIds = useMemo(
		() =>
			optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS
				? allExpandedIds
				: new Set([...configuredExpandedIds, ...searchExpandedIds, ...selectedExpandedIds]),
		[allExpandedIds, configuredExpandedIds, optionsLayout, searchExpandedIds, selectedExpandedIds]
	);
	const visibleEntries = useMemo(() => flattenVisibleTreeNodes(filteredNodes, resolvedExpandedIds), [filteredNodes, resolvedExpandedIds]);
	const selectedIndex = useMemo(() => visibleEntries.findIndex((entry) => selectedIds.has(entry.node.id)), [selectedIds, visibleEntries]);
	const isEntryDisabled = useCallback(
		(entry: TreeVisibleEntry) => entry.node.disabled === true || unavailableNodeIds?.has(entry.node.id) === true,
		[unavailableNodeIds]
	);
	const columnsLayoutDescriptor = useMemo(() => buildTreeColumnsLayoutDescriptor(visibleEntries), [visibleEntries]);
	const resolveColumnsFloatingSize = useCallback<FloatingListboxSizeResolver>(
		(context) => {
			const layout = resolveBalancedTreeColumnsLayout({
				...context,
				descriptor: columnsLayoutDescriptor
			});
			const placementProperties: { [customProperty: `--${string}`]: string | undefined } = {};
			layout.placements.forEach((placement, index) => {
				placementProperties[`--tree-option-${index}-column`] = String(placement.column);
				placementProperties[`--tree-option-${index}-row`] = String(placement.row);
			});

			return {
				width: `${layout.width}px`,
				minWidth: `${layout.minWidth}px`,
				maxWidth: `${layout.width}px`,
				maxHeight: `${layout.maxHeight}px`,
				"--tree-column-count": String(layout.columnCount),
				"--tree-row-count": String(layout.rowCount),
				...placementProperties
			};
		},
		[columnsLayoutDescriptor]
	);
	const {
		activeIndex: listboxActiveIndex,
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
		handleReferenceKeyDown,
		handleFloatingKeyDown,
		getOptionId,
		getActiveOptionId
	} = usePickerFloatingListbox({
		options: visibleEntries,
		selectedIndex,
		open,
		onOpenChange: handleOpenChange,
		onSelect: (entry) => onNodeActivate(entry.node, selectionScopeIndex),
		getOptionDisabled: isEntryDisabled,
		disabled: disabled || isLoading,
		// Основное действие всегда завершает выбор; checkbox multi-select управляет черновиком отдельно.
		closeOnSelect: true,
		allowOpenWithoutOptions: true,
		triggerMode: resolvedTriggerMode,
		placementStrategy: optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? "auto" : "flip",
		resolveFloatingSize: optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? resolveColumnsFloatingSize : undefined
	});
	const focusedOptionIndex = focusedNodeId ? visibleEntries.findIndex((entry) => entry.node.id === focusedNodeId) : -1;
	const renderedActiveIndex = focusedOptionIndex >= 0 ? focusedOptionIndex : listboxActiveIndex;
	const updateFloatingLayout = context.update;
	const hasSelection = selectedIds.size > 0;
	const showTriggerQuery = triggerMode === TREE_TRIGGER_MODE_SEARCH && (open || currentQuery.length > 0);
	const triggerValue = showTriggerQuery ? currentQuery : (selectedSummaryText ?? "");
	const triggerController = usePickerTriggerController({
		mode: resolvedTriggerMode,
		open,
		currentQuery,
		hasDisplayValue: Boolean(selectedSummaryText),
		inputRef,
		setQuery,
		openList,
		close,
		toggleOpen
	});
	const showBulkActions = (optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS || selectionMode === TREE_SELECTION_MODE_MULTI) && bulkActions;
	const showPopupSearch = triggerMode === TREE_TRIGGER_MODE_DISPLAY;
	const popupHeader =
		showBulkActions || showPopupSearch ? (
			<div className={styles.treePopupHeader}>
				{showBulkActions ? (
					<PickerSelectionToolbar
						onSelectAll={bulkActions.onSelectAll}
						onDeselectAll={bulkActions.onDeselectAll}
						selectAllButtonRef={selectAllButtonRef}
					/>
				) : null}
				{showPopupSearch ? (
					<InputText
						value={currentQuery}
						onChange={setQuery}
						onClear={() => setQuery("")}
						placeholder="Поиск по дереву"
						onKeyDown={(event) => {
							if (event.key !== "Escape" && event.key !== TREE_KEY_TAB) {
								event.stopPropagation();
							}
						}}
						onClick={(event) => {
							event.stopPropagation();
						}}
					/>
				) : null}
			</div>
		) : undefined;

	useLayoutEffect(() => {
		if (open && optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS) {
			updateFloatingLayout();
		}
	}, [columnsLayoutDescriptor.signature, open, optionsLayout, updateFloatingLayout]);

	const setInputNode = (node: HTMLInputElement | null) => {
		inputRef.current = node;
	};
	const handleClearSelection = () => {
		onClearSelection?.();
		setQuery("");

		if (selectionMode === TREE_SELECTION_MODE_SINGLE) {
			close();
		}
	};

	const toggleExpand = (entry: TreeVisibleEntry) => {
		if (!entry.hasChildren) {
			return;
		}

		setManualExpansionById((currentExpansionById) => {
			const nextExpansionById = new Map(currentExpansionById);
			const isConfiguredExpanded = currentExpansionById.get(entry.node.id) ?? defaultExpandedCodeKeySet.has(entry.node.codeKey);

			nextExpansionById.set(entry.node.id, !isConfiguredExpanded);

			return nextExpansionById;
		});
	};
	const focusOptionAtIndex = (optionIndex: number) => {
		optionRefs.current[optionIndex]?.focus();
	};
	/**
	 * Клавиатурная модель дерева: стрелки управляют навигацией и ветками,
	 * Space меняет черновик multi-select, а Enter завершает выбор текущим узлом.
	 */
	const handleTreeOptionKeyDown = (event: KeyboardEvent<HTMLElement>, entry: TreeVisibleEntry, optionIndex: number) => {
		if (event.target !== event.currentTarget) {
			return;
		}

		if (event.key === TREE_KEY_NEXT_NODE || event.key === "ArrowUp") {
			event.preventDefault();
			const direction = event.key === TREE_KEY_NEXT_NODE ? 1 : -1;
			focusOptionAtIndex(findNextEnabledIndex(visibleEntries, optionIndex, direction, isEntryDisabled));
			return;
		}

		if (event.key === TREE_KEY_FIRST_NODE || event.key === "End") {
			event.preventDefault();
			const boundaryIndex =
				event.key === TREE_KEY_FIRST_NODE
					? findFirstEnabledIndex(visibleEntries, isEntryDisabled)
					: findLastEnabledIndex(visibleEntries, isEntryDisabled);
			focusOptionAtIndex(boundaryIndex);
			return;
		}

		if (optionsLayout === TREE_OPTIONS_LAYOUT_TREE && event.key === "ArrowRight") {
			event.preventDefault();
			if (entry.hasChildren && !entry.isExpanded) {
				toggleExpand(entry);
				return;
			}

			const firstChildEntry = visibleEntries[optionIndex + 1];
			if (entry.isExpanded && firstChildEntry?.parentId === entry.node.id) {
				focusOptionAtIndex(optionIndex + 1);
			}
			return;
		}

		if (optionsLayout === TREE_OPTIONS_LAYOUT_TREE && event.key === "ArrowLeft") {
			event.preventDefault();
			if (entry.hasChildren && entry.isExpanded) {
				toggleExpand(entry);
				return;
			}

			if (entry.parentId) {
				focusOptionAtIndex(visibleEntries.findIndex((candidate) => candidate.node.id === entry.parentId));
			}
			return;
		}

		if (event.key === " " && selectionMode === TREE_SELECTION_MODE_MULTI && !isEntryDisabled(entry)) {
			event.preventDefault();
			onNodeToggleSelection?.(entry.node, selectionScopeIndex);
			return;
		}

		if (event.key === "Enter" && !isEntryDisabled(entry)) {
			event.preventDefault();
			selectOption(entry);
		}
	};
	const isTreeMultiGrid = optionsLayout === TREE_OPTIONS_LAYOUT_TREE && selectionMode === TREE_SELECTION_MODE_MULTI;
	const handlePopupKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (isTreeMultiGrid && event.target === event.currentTarget && event.key === " ") {
			event.preventDefault();
			const activeEntry = listboxActiveIndex >= 0 ? visibleEntries[listboxActiveIndex] : undefined;
			if (activeEntry && !isEntryDisabled(activeEntry)) {
				onNodeToggleSelection?.(activeEntry.node, selectionScopeIndex);
			}
			return;
		}

		handleFloatingKeyDown(event);
	};

	return (
		<PickerField label={label} description={description} disabled={disabled} size={size} error={fieldError} required={required}>
			{({ controlId, labelId, describedBy }) => {
				const listId = `${controlId}-${optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? "dialog" : isTreeMultiGrid ? "treegrid" : "tree"}`;
				const popupAriaLabel = typeof label === "string" ? label : placeholder;

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
							optionCount={treeIndex.nodeById.size}
							label={label}
							placeholder={placeholder}
							readOnly={triggerMode !== TREE_TRIGGER_MODE_SEARCH}
							value={triggerValue}
							selectedValue={selectedSummary ?? selectedSummaryText}
							hasSelection={hasSelection}
							showSelectedValue={
								hasSelection &&
								(resolvedTriggerMode === PICKER_TRIGGER_MODE_SEARCH_MULTI ? currentQuery.length === 0 : !showTriggerQuery)
							}
							clearable={onClearSelection !== undefined}
							onClear={handleClearSelection}
							onToggleMouseDown={triggerController.handleToggleMouseDown}
							onToggleClick={triggerController.handleToggleClick}
							aria-labelledby={labelId}
							aria-label={labelId ? undefined : placeholder}
							aria-describedby={describedBy}
							aria-required={required || undefined}
							aria-invalid={Boolean(fieldError) || undefined}
							aria-haspopup={optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? "dialog" : isTreeMultiGrid ? "grid" : "tree"}
							aria-expanded={open}
							aria-controls={open ? listId : undefined}
							aria-autocomplete={
								optionsLayout !== TREE_OPTIONS_LAYOUT_COLUMNS && triggerMode === TREE_TRIGGER_MODE_SEARCH ? "list" : "none"
							}
							aria-activedescendant={
								optionsLayout !== TREE_OPTIONS_LAYOUT_COLUMNS && open && visibleEntries.length > 0
									? getActiveOptionId(listId)
									: undefined
							}
							onChange={(event) => {
								if (triggerMode !== TREE_TRIGGER_MODE_SEARCH) {
									return;
								}

								triggerController.handleTriggerInputChange(event.target.value);
							}}
							onClick={triggerController.handleTriggerClick}
							onFocus={(event) => {
								setFocusedNodeId(undefined);
								triggerController.handleTriggerFocus(event.currentTarget);
							}}
							onKeyDown={(event) => {
								if (
									optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS &&
									open &&
									event.key === TREE_KEY_TAB &&
									!event.shiftKey &&
									selectAllButtonRef.current
								) {
									event.preventDefault();
									selectAllButtonRef.current.focus();
									return;
								}

								handleReferenceKeyDown(event);

								if (event.defaultPrevented) {
									return;
								}

								if (isTreeMultiGrid && open && event.ctrlKey && event.key === " ") {
									event.preventDefault();
									const activeEntry = listboxActiveIndex >= 0 ? visibleEntries[listboxActiveIndex] : undefined;
									if (activeEntry && !isEntryDisabled(activeEntry)) {
										onNodeToggleSelection?.(activeEntry.node, selectionScopeIndex);
									}
									return;
								}

								triggerController.handleTriggerKeyDown({
									event,
									onActivateWhenOpen: () => {
										const activeEntry = listboxActiveIndex >= 0 ? visibleEntries[listboxActiveIndex] : undefined;
										if (activeEntry) {
											selectOption(activeEntry);
										}
									},
									enableSpaceActivation: triggerMode === TREE_TRIGGER_MODE_DISPLAY
								});
							}}
						/>

						<PickerPopup
							open={open}
							context={context}
							floatingStyles={floatingStyles}
							listId={listId}
							labelId={labelId}
							popupAriaLabel={popupAriaLabel}
							descriptionId={describedBy}
							activeOptionId={
								optionsLayout !== TREE_OPTIONS_LAYOUT_COLUMNS && visibleEntries.length > 0
									? getActiveOptionId(listId)
									: undefined
							}
							ariaMultiselectable={isTreeMultiGrid}
							popupRole={optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? "dialog" : isTreeMultiGrid ? "treegrid" : "tree"}
							setFloating={setFloating}
							getFloatingProps={getFloatingProps}
							onKeyDown={handlePopupKeyDown}
							layoutClassName={optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? styles.treeColumnsPopupLayout : undefined}
							bodyClassName="scrollable"
							toolbar={popupHeader}>
							<div role="presentation" className={cn(optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS && styles.treeColumns)}>
								{visibleEntries.length === 0 ? (
									<PickerStatus errorState={error} emptyState={!error && !isLoading ? "Нет данных" : undefined} />
								) : (
									visibleEntries.map((entry, index) => {
										const selected =
											selectionMode === TREE_SELECTION_MODE_MULTI
												? isTreeNodeSelected(entry.node.id, selectedIds, treeIndex)
												: selectedIds.has(entry.node.id);
										const partial =
											selectionMode === TREE_SELECTION_MODE_MULTI && !selected && partialIds.has(entry.node.id);
										const active = index === renderedActiveIndex;
										const optionDisabled =
											entry.node.disabled === true || unavailableNodeIds?.has(entry.node.id) === true;

										return (
											<Option
												key={entry.node.id}
												data-ui="tree-select-option"
												id={getOptionId(listId, index)}
												ref={
													optionsLayout === TREE_OPTIONS_LAYOUT_TREE
														? (node) => {
																optionRefs.current[index] = node;
																setOptionRef(index, node);
															}
														: undefined
												}
												tabIndex={optionsLayout === TREE_OPTIONS_LAYOUT_TREE ? -1 : undefined}
												role={
													optionsLayout === TREE_OPTIONS_LAYOUT_TREE
														? isTreeMultiGrid
															? "row"
															: "treeitem"
														: undefined
												}
												aria-level={optionsLayout === TREE_OPTIONS_LAYOUT_TREE ? entry.level + 1 : undefined}
												aria-expanded={
													optionsLayout === TREE_OPTIONS_LAYOUT_TREE && entry.hasChildren
														? entry.isExpanded
														: undefined
												}
												aria-selected={optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? undefined : selected}
												aria-disabled={optionDisabled || undefined}
												disabled={optionDisabled}
												active={active}
												selected={selected}
												onFocus={() => setFocusedNodeId(entry.node.id)}
												onKeyDown={
													optionsLayout === TREE_OPTIONS_LAYOUT_TREE
														? (event) => handleTreeOptionKeyDown(event, entry, index)
														: undefined
												}
												onMouseDown={
													optionsLayout === TREE_OPTIONS_LAYOUT_TREE && !isTreeMultiGrid
														? (event) => event.preventDefault()
														: undefined
												}
												onClick={
													optionsLayout === TREE_OPTIONS_LAYOUT_TREE && !isTreeMultiGrid
														? () => selectOption(entry)
														: undefined
												}
												className={optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS ? styles.treeColumnRow : undefined}
												style={
													optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS
														? ({
																"--tree-option-column": `var(--tree-option-${index}-column, auto)`,
																"--tree-option-row": `var(--tree-option-${index}-row, auto)`
															} as CSSProperties)
														: undefined
												}>
												<TreeNodeContent
													node={optionDisabled ? { ...entry.node, disabled: true } : entry.node}
													level={entry.level}
													highlight={currentQuery}
													hasChildren={entry.hasChildren}
													isExpanded={entry.isExpanded}
													selected={selected}
													partial={partial}
													selectionMode={selectionMode}
													optionsLayout={optionsLayout}
													actionRef={
														optionsLayout === TREE_OPTIONS_LAYOUT_COLUMNS
															? (node) => {
																	optionRefs.current[index] = node;
																	setOptionRef(index, node);
																}
															: undefined
													}
													onToggleExpand={() => toggleExpand(entry)}
													onToggleSelection={() => onNodeToggleSelection?.(entry.node, selectionScopeIndex)}
													onActivate={() => selectOption(entry)}
												/>
											</Option>
										);
									})
								)}
							</div>
						</PickerPopup>
					</>
				);
			}}
		</PickerField>
	);
}
