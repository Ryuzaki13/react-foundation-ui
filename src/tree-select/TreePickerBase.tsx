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
import { TreeMultiSelectOptionsLayout, TreeSelectNode } from "./types";

type TreePickerBulkActions = {
	onSelectAll: () => void;
	onDeselectAll: () => void;
};

type TreePickerBaseProps = Omit<UiBaseProps<never>, "value" | "onChange"> & {
	nodes: readonly TreeSelectNode[];
	selectedIds: Set<string>;
	partialIds: Set<string>;
	selectionMode: "single" | "multi";
	optionsLayout?: TreeMultiSelectOptionsLayout;
	defaultExpandedCodeKeys?: readonly string[];
	/** Узлы, которые текущий multi-select contract не может безопасно сериализовать. */
	unavailableNodeIds?: ReadonlySet<string>;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	bulkActions?: TreePickerBulkActions;
	triggerMode?: "display" | "search";
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
	optionsLayout = "tree",
	defaultExpandedCodeKeys,
	unavailableNodeIds,
	open: controlledOpen,
	onOpenChange,
	bulkActions,
	triggerMode = "display",
	selectedSummary,
	selectedSummaryText,
	query,
	defaultQuery,
	onQuery,
	onNodeActivate,
	onNodeToggleSelection,
	onClearSelection,
	isLoading,
	error
}: TreePickerBaseProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const selectAllButtonRef = useRef<HTMLButtonElement | null>(null);
	const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
	/** Явный owner open-state позволяет сбрасывать query непосредственно в close-событии. */
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	/**
	 * Сохраняет строку, в которую фокус вошёл через независимый expander или
	 * checkbox. Это синхронизирует видимый active-state, не превращая строку в
	 * единственный tab-stop и не меняя доступность вложенных контролов.
	 */
	const [focusedNodeId, setFocusedNodeId] = useState<string>();
	const isOpenControlled = controlledOpen !== undefined;
	const open = isOpenControlled ? controlledOpen : uncontrolledOpen;
	const [manualExpansionById, setManualExpansionById] = useState<ReadonlyMap<string, boolean>>(() => new Map());
	const resolvedTriggerMode = triggerMode === "search" ? (selectionMode === "multi" ? "search-multi" : "search-single") : "display";
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
			optionsLayout === "columns"
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
		// selectOption вызывается только основной кнопкой; checkbox обходит его и остаётся в draft-режиме.
		closeOnSelect: true,
		allowOpenWithoutOptions: true,
		triggerMode: resolvedTriggerMode,
		placementStrategy: optionsLayout === "columns" ? "auto" : "flip",
		resolveFloatingSize: optionsLayout === "columns" ? resolveColumnsFloatingSize : undefined
	});
	const focusedOptionIndex = focusedNodeId ? visibleEntries.findIndex((entry) => entry.node.id === focusedNodeId) : -1;
	const renderedActiveIndex = focusedOptionIndex >= 0 ? focusedOptionIndex : listboxActiveIndex;
	const updateFloatingLayout = context.update;
	const hasSelection = selectedIds.size > 0;
	const showTriggerQuery = triggerMode === "search" && (open || currentQuery.length > 0);
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
	const showBulkActions = optionsLayout === "columns" && selectionMode === "multi" && bulkActions;
	const showPopupSearch = triggerMode === "display";
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
							if (event.key !== "Escape" && event.key !== "Tab") {
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
		if (open && optionsLayout === "columns") {
			updateFloatingLayout();
		}
	}, [columnsLayoutDescriptor.signature, open, optionsLayout, updateFloatingLayout]);

	const setInputNode = (node: HTMLInputElement | null) => {
		inputRef.current = node;
	};
	const handleClearSelection = () => {
		onClearSelection?.();
		setQuery("");

		if (selectionMode === "single") {
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
	 * Объединяет клавиатурную модель строки для внешней Option и её независимых
	 * контролов: вертикальные клавиши перемещают строковый фокус, горизонтальные
	 * управляют веткой, Space меняет checkbox, а Enter выполняет основное действие.
	 */
	const handleTreeOptionKeyDown = (event: KeyboardEvent<HTMLElement>, entry: TreeVisibleEntry, optionIndex: number) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const direction = event.key === "ArrowDown" ? 1 : -1;
			focusOptionAtIndex(findNextEnabledIndex(visibleEntries, optionIndex, direction, isEntryDisabled));
			return;
		}

		if (event.key === "Home" || event.key === "End") {
			event.preventDefault();
			const boundaryIndex =
				event.key === "Home"
					? findFirstEnabledIndex(visibleEntries, isEntryDisabled)
					: findLastEnabledIndex(visibleEntries, isEntryDisabled);
			focusOptionAtIndex(boundaryIndex);
			return;
		}

		if (optionsLayout === "tree" && event.key === "ArrowRight") {
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

		if (optionsLayout === "tree" && event.key === "ArrowLeft") {
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

		if (event.key === " " && selectionMode === "multi" && !isEntryDisabled(entry)) {
			event.preventDefault();
			onNodeToggleSelection?.(entry.node, selectionScopeIndex);
			return;
		}

		if (event.key === "Enter" && !isEntryDisabled(entry)) {
			event.preventDefault();
			selectOption(entry);
		}
	};

	return (
		<PickerField label={label} description={description} disabled={disabled} size={size}>
			{({ controlId, labelId, describedBy }) => {
				const listId = `${controlId}-listbox`;
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
							readOnly={triggerMode !== "search"}
							value={triggerValue}
							selectedValue={selectedSummary ?? selectedSummaryText}
							hasSelection={hasSelection}
							showSelectedValue={
								hasSelection && (resolvedTriggerMode === "search-multi" ? currentQuery.length === 0 : !showTriggerQuery)
							}
							clearable={onClearSelection !== undefined}
							onClear={handleClearSelection}
							onToggleMouseDown={triggerController.handleToggleMouseDown}
							onToggleClick={triggerController.handleToggleClick}
							aria-labelledby={labelId}
							aria-label={labelId ? undefined : placeholder}
							aria-describedby={describedBy}
							aria-haspopup={optionsLayout === "columns" ? "dialog" : "listbox"}
							aria-expanded={open}
							aria-controls={open ? listId : undefined}
							aria-autocomplete={optionsLayout !== "columns" && triggerMode === "search" ? "list" : "none"}
							aria-activedescendant={
								optionsLayout !== "columns" && open && visibleEntries.length > 0 ? getActiveOptionId(listId) : undefined
							}
							onChange={(event) => {
								if (triggerMode !== "search") {
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
									optionsLayout === "columns" &&
									open &&
									event.key === "Tab" &&
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

								triggerController.handleTriggerKeyDown({
									event,
									onActivateWhenOpen: () => {
										const activeEntry = listboxActiveIndex >= 0 ? visibleEntries[listboxActiveIndex] : undefined;
										if (activeEntry) {
											selectOption(activeEntry);
										}
									},
									enableSpaceActivation: triggerMode === "display"
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
								optionsLayout !== "columns" && visibleEntries.length > 0 ? getActiveOptionId(listId) : undefined
							}
							ariaMultiselectable={optionsLayout !== "columns" && selectionMode === "multi"}
							popupRole={optionsLayout === "columns" ? "dialog" : "listbox"}
							setFloating={setFloating}
							getFloatingProps={getFloatingProps}
							onKeyDown={handleFloatingKeyDown}
							layoutClassName={optionsLayout === "columns" ? styles.treeColumnsPopupLayout : undefined}
							bodyClassName="scrollable"
							toolbar={popupHeader}>
							<div className={cn(optionsLayout === "columns" && styles.treeColumns)}>
								{visibleEntries.length === 0 ? (
									<PickerStatus errorState={error} emptyState={!error && !isLoading ? "Нет данных" : undefined} />
								) : (
									visibleEntries.map((entry, index) => {
										const selected =
											selectionMode === "multi"
												? isTreeNodeSelected(entry.node.id, selectedIds, treeIndex)
												: selectedIds.has(entry.node.id);
										const partial = selectionMode === "multi" && !selected && partialIds.has(entry.node.id);
										const active = index === renderedActiveIndex;
										const optionDisabled =
											entry.node.disabled === true || unavailableNodeIds?.has(entry.node.id) === true;

										return (
											<Option
												key={entry.node.id}
												data-ui="tree-select-option"
												id={getOptionId(listId, index)}
												ref={(node) => {
													optionRefs.current[index] = node;
													setOptionRef(index, node);
												}}
												tabIndex={-1}
												role={optionsLayout === "columns" ? undefined : "option"}
												aria-selected={optionsLayout === "columns" ? undefined : selected}
												disabled={optionDisabled}
												active={active}
												selected={selected}
												onFocus={() => setFocusedNodeId(entry.node.id)}
												onKeyDown={(event) => handleTreeOptionKeyDown(event, entry, index)}
												className={optionsLayout === "columns" ? styles.treeColumnRow : undefined}
												style={
													optionsLayout === "columns"
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
