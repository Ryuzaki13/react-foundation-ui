import { useCallback, useEffect, useMemo } from "react";

import { useODataTableColumns } from "@ryuzaki13/react-foundation-api/odata";
import { type TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";

import { Badge, BadgeList } from "../../badge";
import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { GridContainer } from "../../grid";
import { InputSearch } from "../../input-search";
import { Scrollable } from "../../misc";
import { Modal, ModalContent, ModalFooter, ModalToolbar } from "../../modal";
import { ODataDependentMultiSelect } from "../../multi-select";
import { Table } from "../../table";
import { SearchConfig, useAdvancedSearch, useAdvancedSearchSelection } from "../model";

interface SearchModalProps<T extends Record<string, string>> {
	onClose: () => void;
	onItemsSelect: (items: T[]) => void;
	initialSelectedItems?: T[];
	config: SearchConfig<T>;
}

/**
 * Модальное окно поиска клиентов
 */
export function AdvancedSearchModal<T extends Record<string, string>>({
	onClose,
	onItemsSelect,
	config,
	initialSelectedItems = []
}: SearchModalProps<T>) {
	const tableColumns: TableColumnDef<T>[] = useMemo(
		() =>
			config.columns.map(
				(col) =>
					({
						id: col.key as keyof T,
						accessorKey: col.key as keyof T,
						header: col.label,
						meta: {
							width: col.width || "auto"
						}
					}) as TableColumnDef<T>
			),
		[config.columns]
	);

	const { columns, isLoading } = useODataTableColumns<T>({
		service: config.odata.service,
		target: config.odata.target,
		mode: "enrich",
		columns: tableColumns
	});

	const { query, items, searchTerm, setSearch, clearSearch, filters, setFilters } = useAdvancedSearch(config);
	const { selectedItems, deselect, replaceSelection } = useAdvancedSearchSelection(config);
	const getRowId = useCallback((item: T) => String(item[config.leadingKey]), [config.leadingKey]);
	const selectedRowIds = useMemo(() => selectedItems.map((item) => String(item[config.leadingKey])), [selectedItems, config.leadingKey]);
	const visibleItemIds = useMemo(() => new Set(items.map((item) => String(item[config.leadingKey]))), [items, config.leadingKey]);

	// До изменения: пустой внешний набор не очищал внутренний выбор.
	// После изменения: модальное окно синхронизирует выбор с внешним набором полностью.
	useEffect(() => {
		replaceSelection(initialSelectedItems);
	}, [initialSelectedItems, replaceSelection]);

	const handleReachEnd = useCallback(() => {
		if (query.hasNextPage && !query.isFetchingNextPage) {
			query.fetchNextPage();
		}
	}, [query]);

	// До изменения: выбор собирался чекбоксами по строкам.
	// После изменения: таблица управляет multi-selection, а модалка сохраняет скрытые фильтрами элементы.
	const handleSelect = useCallback(
		(selectedVisibleItems: T[]) => {
			const selectedVisibleIds = new Set(selectedVisibleItems.map((item) => String(item[config.leadingKey])));
			const hiddenSelectedItems = selectedItems.filter((item) => !visibleItemIds.has(String(item[config.leadingKey])));
			const nextVisibleSelectedItems = items.filter((item) => selectedVisibleIds.has(String(item[config.leadingKey])));

			replaceSelection([...hiddenSelectedItems, ...nextVisibleSelectedItems]);
		},
		[config.leadingKey, items, replaceSelection, selectedItems, visibleItemIds]
	);

	/**
	 * Удаляет отдельный элемент из общего выбора.
	 */
	const handleRemoveSelectedItem = useCallback(
		(item: T) => {
			deselect(String(item[config.leadingKey]));
		},
		[config.leadingKey, deselect]
	);

	// Обработчик подтверждения выбора
	const handleConfirmSelection = useCallback(() => {
		onItemsSelect(selectedItems);
		onClose();
	}, [selectedItems, onItemsSelect, onClose]);

	const filterConfig = useMemo(() => {
		if ("segments" in config && config.segments) {
			const limitedKeys = Object.keys(config.segments);
			if (limitedKeys.length) {
				return {
					odata: { ...config.odata, limitedKeys },
					segments: config.segments,
					model: config.model
				};
			}
		}
	}, [config]);

	return (
		<Modal isOpen onClose={onClose} title={config.title} size="lg" height="min(50em, 80dvh)">
			<ModalToolbar>
				<FlexContainer gap="sm">
					{filterConfig && (
						<ODataDependentMultiSelect
							odata={filterConfig.odata}
							segments={filterConfig.segments}
							model={filterConfig.model}
							values={filters}
							onChange={setFilters}
						/>
					)}

					<InputSearch
						size="md"
						placeholder={config.searchLabel ?? "Введите поисковый запрос"}
						value={searchTerm}
						onChange={setSearch}
						onClear={clearSearch}
						className="flexGrow"
					/>
				</FlexContainer>
			</ModalToolbar>

			<ModalContent>
				<GridContainer gap="md" templateRows="1fr auto" className="h100">
					<Table
						columns={columns}
						data={items}
						selectionMode="multi"
						selectedRowIds={selectedRowIds}
						getRowId={getRowId}
						isLoading={query.isLoading || isLoading}
						isFetching={query.isFetching} // или query.isFetchingNextPage
						onRowSelectionChange={handleSelect}
						onReachEnd={handleReachEnd}
						className="w100"
					/>

					<div className="marginBlockMd border">
						<Scrollable className="paddingSm" height="6em">
							<BadgeList>
								{selectedItems.map((item) => (
									<Badge
										key={item[config.leadingKey]}
										size="md"
										tone="info"
										appearance="outline"
										onRemove={() => handleRemoveSelectedItem(item)}>
										{config.leadingText ? item[config.leadingText] || item[config.leadingKey] : item[config.leadingKey]}
									</Badge>
								))}
							</BadgeList>
						</Scrollable>
					</div>
				</GridContainer>
			</ModalContent>

			<ModalFooter>
				<Button onClick={onClose}>Отмена</Button>
				<Button variant="successOutline" onClick={handleConfirmSelection}>
					Выбрать
				</Button>
			</ModalFooter>
		</Modal>
	);
}
