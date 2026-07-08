import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { XIcon } from "lucide-react";

import { InputText } from "../input";
import {
	PickerField,
	PickerPopup,
	PickerStatus,
	PickerTriggerActions,
	PickerTriggerInput,
	usePickerFloatingListbox,
	usePickerQuery,
	usePickerTriggerController
} from "../picker";
import { UiBaseProps } from "../types";
import uiStyles from "../ui.module.scss";

import {
	createTreeNodeIndex,
	filterTreeNodes,
	flattenVisibleTreeNodes,
	getSelectionExpandedIds,
	TreeVisibleEntry
} from "./model/treeUtils";
import { TreeNodeContent } from "./TreeNodeContent";
import styles from "./TreeSelect.module.scss";
import { TreeSelectNode } from "./types";

type TreePickerBaseProps = Omit<UiBaseProps<never>, "value" | "onChange"> & {
	nodes: readonly TreeSelectNode[];
	selectedIds: Set<string>;
	partialIds: Set<string>;
	selectionMode: "single" | "multi";
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
	const previousOpenRef = useRef(false);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
	const resolvedTriggerMode = triggerMode === "search" ? "search-single" : "display";
	const treeIndex = useMemo(() => createTreeNodeIndex(nodes), [nodes]);
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
	const resolvedExpandedIds = useMemo(
		() => new Set([...expandedIds, ...searchExpandedIds, ...selectedExpandedIds]),
		[expandedIds, searchExpandedIds, selectedExpandedIds]
	);
	const visibleEntries = useMemo(() => flattenVisibleTreeNodes(filteredNodes, resolvedExpandedIds), [filteredNodes, resolvedExpandedIds]);
	const selectedIndex = useMemo(() => visibleEntries.findIndex((entry) => selectedIds.has(entry.node.id)), [selectedIds, visibleEntries]);
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
		onSelect: (entry) => onNodeActivate(entry.node),
		disabled: disabled || isLoading,
		closeOnSelect: selectionMode === "single",
		allowOpenWithoutOptions: true,
		triggerMode: resolvedTriggerMode
	});
	const hasSelection = selectedIds.size > 0;
	const showTriggerQuery = triggerMode === "search" && (open || currentQuery.length > 0);
	const triggerValue = showTriggerQuery ? currentQuery : (selectedSummaryText ?? "");
	const showSummaryOverlay = triggerMode === "display" && Boolean(selectedSummary);
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

	useEffect(() => {
		if (previousOpenRef.current && !open && triggerController.policy.resetQueryOnClose) {
			setQuery("");
		}

		previousOpenRef.current = open;
	}, [open, setQuery, triggerController.policy.resetQueryOnClose]);

	const setInputNode = (node: HTMLInputElement | null) => {
		inputRef.current = node;
	};
	const handleClearSelection = () => {
		onClearSelection?.();
		setQuery("");
		close();
	};

	const toggleExpand = (entry: TreeVisibleEntry) => {
		if (!entry.hasChildren) {
			return;
		}

		setExpandedIds((currentExpandedIds) => {
			const nextExpandedIds = new Set(currentExpandedIds);

			if (nextExpandedIds.has(entry.node.id)) {
				nextExpandedIds.delete(entry.node.id);
			} else {
				nextExpandedIds.add(entry.node.id);
			}

			return nextExpandedIds;
		});
	};

	return (
		<PickerField label={label} description={description} disabled={disabled} placeholder={placeholder} size={size}>
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
							disabled={disabled || isLoading}
							readOnly={triggerMode !== "search"}
							value={triggerMode === "display" && showSummaryOverlay ? "" : triggerValue}
							placeholder={
								triggerMode === "search"
									? !selectedSummaryText || showTriggerQuery
										? placeholder
										: undefined
									: hasSelection
										? undefined
										: placeholder
							}
							aria-labelledby={labelId}
							aria-describedby={describedBy}
							aria-haspopup="listbox"
							aria-expanded={open}
							aria-controls={open ? listId : undefined}
							aria-autocomplete={triggerMode === "search" ? "list" : "none"}
							aria-activedescendant={open && visibleEntries.length > 0 ? getActiveOptionId(listId) : undefined}
							inputClassName={cn(hasSelection && styles.treeSummary, showSummaryOverlay && styles.inputWithOverlay)}
							overlay={showSummaryOverlay ? <div className={styles.valueOverlay}>{selectedSummary}</div> : undefined}
							endAdornment={
								<PickerTriggerActions
									open={open}
									disabled={disabled || isLoading}
									onToggleMouseDown={triggerController.handleToggleMouseDown}
									onToggleClick={triggerController.handleToggleClick}>
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
							descriptionId={describedBy}
							activeOptionId={visibleEntries.length > 0 ? getActiveOptionId(listId) : undefined}
							setFloating={setFloating}
							getFloatingProps={getFloatingProps}
							onKeyDown={handleFloatingKeyDown}
							className={cn(uiStyles.uiPopupOptions, "scrollable")}
							header={
								triggerMode === "display" ? (
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
								) : undefined
							}>
							<div className="">
								{visibleEntries.length === 0 ? (
									<PickerStatus
										errorState={error}
										loadingState={isLoading ? "Загрузка..." : undefined}
										emptyState={!error && !isLoading ? "Нет данных" : undefined}
									/>
								) : (
									visibleEntries.map((entry, index) => {
										const selected = selectedIds.has(entry.node.id);
										const partial = !selected && partialIds.has(entry.node.id);
										const active = index === activeIndex;

										return (
											<div
												key={entry.node.id}
												id={getOptionId(listId, index)}
												ref={(node) => setOptionRef(index, node)}
												role="option"
												aria-selected={selected}
												className={cn(
													styles.treeRow,
													active && styles.treeRowActive,
													selected && styles.treeRowSelected
												)}
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
														onToggleExpand={() => toggleExpand(entry)}
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
