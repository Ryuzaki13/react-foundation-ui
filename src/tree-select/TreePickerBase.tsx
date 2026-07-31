import { type CSSProperties, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { type FloatingListboxSizeResolver } from "@ryuzaki13/react-foundation-lib/hooks";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { XIcon } from "lucide-react";

import { InputText } from "../input";
import {
	PickerField,
	PickerPopup,
	PickerSelectionToolbar,
	PickerStatus,
	PickerTriggerActions,
	PickerTriggerInput,
	usePickerFloatingListbox,
	usePickerQuery,
	usePickerTriggerController
} from "../picker";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import { buildTreeColumnsLayoutDescriptor } from "./model/buildTreeColumnsLayoutDescriptor";
import { resolveBalancedTreeColumnsLayout } from "./model/resolveBalancedTreeColumnsLayout";
import {
	createTreeNodeIndex,
	filterTreeNodes,
	flattenVisibleTreeNodes,
	getConfiguredTreeExpandedIds,
	getSelectionExpandedIds,
	isTreeNodeSelected,
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
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	bulkActions?: TreePickerBulkActions;
	triggerMode?: "display" | "search";
	selectedSummary?: ReactNode;
	selectedSummaryText?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	onNodeActivate: (node: TreeSelectNode) => void;
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
	onClearSelection,
	isLoading,
	error
}: TreePickerBaseProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const selectAllButtonRef = useRef<HTMLButtonElement | null>(null);
	const previousOpenRef = useRef(false);
	const [manualExpansionById, setManualExpansionById] = useState<ReadonlyMap<string, boolean>>(() => new Map());
	const resolvedTriggerMode = triggerMode === "search" ? (selectionMode === "multi" ? "search-multi" : "search-single") : "display";
	const treeIndex = useMemo(() => createTreeNodeIndex(nodes), [nodes]);
	const placeholderText = useMemo(() => `${placeholder} <${treeIndex.nodeById.size}>`, [placeholder, treeIndex]);
	const defaultExpandedCodeKeySet = useMemo(() => new Set(defaultExpandedCodeKeys), [defaultExpandedCodeKeys]);
	const { query: currentQuery, setQuery } = usePickerQuery({
		open: true,
		query,
		defaultQuery,
		onQuery,
		triggerMode: "display"
	});
	const { nodes: filteredNodes, expandedIds: searchExpandedIds } = useMemo(
		() => filterTreeNodes(nodes, currentQuery),
		[nodes, currentQuery]
	);
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
		open,
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
		handleReferenceKeyDown,
		handleFloatingKeyDown,
		getOptionId,
		getActiveOptionId
	} = usePickerFloatingListbox({
		options: visibleEntries,
		selectedIndex,
		open: controlledOpen,
		onOpenChange,
		onSelect: (entry) => onNodeActivate(entry.node),
		getOptionDisabled: (entry) => entry.node.disabled === true,
		disabled: disabled || isLoading,
		closeOnSelect: selectionMode === "single",
		allowOpenWithoutOptions: true,
		triggerMode: resolvedTriggerMode,
		placementStrategy: optionsLayout === "columns" ? "auto" : "flip",
		resolveFloatingSize: optionsLayout === "columns" ? resolveColumnsFloatingSize : undefined
	});
	const updateFloatingLayout = context.update;
	const hasSelection = selectedIds.size > 0;
	const showTriggerQuery = triggerMode === "search" && (open || currentQuery.length > 0);
	const triggerValue = showTriggerQuery ? currentQuery : (selectedSummaryText ?? "");
	const showSummaryOverlay = triggerMode === "display" && Boolean(selectedSummary);
	const showSummaryToken = resolvedTriggerMode === "search-multi" && Boolean(selectedSummary);
	const showTriggerPlaceholder =
		(resolvedTriggerMode === "search-multi" && !hasSelection) ||
		(resolvedTriggerMode === "search-single" && (!selectedSummaryText || showTriggerQuery)) ||
		(resolvedTriggerMode === "display" && !hasSelection);
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

	useEffect(() => {
		if (previousOpenRef.current && !open && triggerController.policy.resetQueryOnClose) {
			setQuery("");
		}

		previousOpenRef.current = open;
	}, [open, setQuery, triggerController.policy.resetQueryOnClose]);

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

	return (
		<PickerField label={label} description={description} disabled={disabled} size={size}>
			{({ controlId, labelId, describedBy }) => {
				const listId = `${controlId}-listbox`;
				const popupAriaLabel = typeof label === "string" ? label : placeholder;

				return (
					<>
						<PickerTriggerInput
							ref={setInputNode}
							rootRef={setReference}
							id={controlId}
							type="text"
							role="combobox"
							autoComplete="off"
							disabled={disabled || isLoading}
							readOnly={triggerMode !== "search"}
							value={triggerMode === "display" && showSummaryOverlay ? "" : triggerValue}
							placeholder={showTriggerPlaceholder ? placeholderText : undefined}
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
							inputClassName={cn(hasSelection && styles.treeSummary, showSummaryOverlay && styles.inputWithOverlay)}
							overlay={showSummaryOverlay ? <div className={styles.valueOverlay}>{selectedSummary}</div> : undefined}
							endAdornment={
								<PickerTriggerActions
									open={open}
									disabled={disabled || isLoading}
									onToggleMouseDown={triggerController.handleToggleMouseDown}
									onToggleClick={triggerController.handleToggleClick}>
									{showSummaryToken ? selectedSummary : null}

									{hasSelection && onClearSelection ? (
										<button
											type="button"
											className={styles.treeClearButton}
											onMouseDown={(event) => {
												event.preventDefault();
												event.stopPropagation();
											}}
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												handleClearSelection();
											}}
											aria-label="Очистить выбор">
											<XIcon />
										</button>
									) : null}
								</PickerTriggerActions>
							}
							onChange={(event) => {
								if (triggerMode !== "search") {
									return;
								}

								triggerController.handleTriggerInputChange(event.target.value);
							}}
							onClick={triggerController.handleTriggerClick}
							onFocus={(event) => {
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
										const activeEntry = activeIndex >= 0 ? visibleEntries[activeIndex] : undefined;
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
							className={uiStyles.uiPopupOptions}
							layoutClassName={optionsLayout === "columns" ? styles.treeColumnsPopupLayout : undefined}
							bodyClassName="scrollable"
							header={popupHeader}>
							<div className={cn(optionsLayout === "columns" && styles.treeColumns)}>
								{visibleEntries.length === 0 ? (
									<PickerStatus
										errorState={error}
										loadingState={isLoading ? "Загрузка..." : undefined}
										emptyState={!error && !isLoading ? "Нет данных" : undefined}
									/>
								) : (
									visibleEntries.map((entry, index) => {
										const selected =
											selectionMode === "multi"
												? isTreeNodeSelected(entry.node.id, selectedIds, treeIndex)
												: selectedIds.has(entry.node.id);
										const partial = selectionMode === "multi" && !selected && partialIds.has(entry.node.id);
										const active = index === activeIndex;
										const optionDisabled = entry.node.disabled === true;

										return (
											<div
												key={entry.node.id}
												data-ui="tree-select-option"
												id={getOptionId(listId, index)}
												ref={(node) => setOptionRef(index, node)}
												role={optionsLayout === "columns" ? undefined : "option"}
												aria-selected={optionsLayout === "columns" ? undefined : selected}
												aria-disabled={optionDisabled || undefined}
												className={cn(
													styles.treeRow,
													optionsLayout === "columns" && styles.treeColumnRow,
													optionDisabled && styles.treeRowDisabled,
													active && styles.treeRowActive,
													selected && styles.treeRowSelected
												)}
												style={
													optionsLayout === "columns"
														? ({
																"--tree-option-column": `var(--tree-option-${index}-column, auto)`,
																"--tree-option-row": `var(--tree-option-${index}-row, auto)`
															} as CSSProperties)
														: undefined
												}
												onMouseDown={(event) => {
													event.preventDefault();
												}}
												onClick={() => selectOption(entry)}>
												<div className={styles.treeNodeButton}>
													<TreeNodeContent
														node={entry.node}
														level={entry.level}
														highlight={currentQuery}
														hasChildren={entry.hasChildren}
														isExpanded={entry.isExpanded}
														selected={selected}
														partial={partial}
														selectionMode={selectionMode}
														optionsLayout={optionsLayout}
														onToggleExpand={() => toggleExpand(entry)}
														onToggleSelection={() => selectOption(entry)}
													/>
												</div>
											</div>
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
