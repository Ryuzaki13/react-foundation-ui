import { useMemo, useState, type ComponentType } from "react";

import { useODataTableColumns } from "@ryuzaki13/react-foundation-api/odata";
import { type EntityColumnProperty, EntityMetadata, ServiceMetadata } from "@ryuzaki13/react-foundation-lib/odata-service";
import { createQueryClient } from "@ryuzaki13/react-foundation-lib/query-client";
import { createTableColumnsFromODataMetadata, type TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";
import { QueryClientProvider } from "@tanstack/react-query";

import { TreeTable, type TreeTableProps } from "../TreeTable";

import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

interface FinancialRow {
	id: string;
	parentId: string | null;
	label: string;
	jan: string;
	feb: string;
	mar: string;
	apr: string;
	isLocked?: boolean;
}

/**
 * Данные для stories с formatting-runtime в древовидной таблице.
 */
interface FinancialFormattingRow {
	id: string;
	parentId: string | null;
	label: string;
	purchasePrice: number;
	salePrice: number;
	healthScore: number;
	pendingAmount: number;
	createdAt: string;
	totalAmount: number;
}

interface DivisionTreeRow {
	id: string;
	parentId: string | null;
	label: string;
	division: string;
}

const demoRows: FinancialRow[] = [
	{ id: "revenue", parentId: null, label: "Выручка", jan: "1 240", feb: "1 320", mar: "1 410", apr: "1 505" },
	{ id: "revenue_clients", parentId: "revenue", label: "Клиентский сегмент", jan: "920", feb: "960", mar: "1 020", apr: "1 080" },
	{ id: "revenue_exports", parentId: "revenue", label: "Экспорт", jan: "320", feb: "360", mar: "390", apr: "425" },
	{ id: "margin", parentId: null, label: "Маржинальность", jan: "18%", feb: "19%", mar: "21%", apr: "20%" },
	{ id: "margin_sales", parentId: "margin", label: "Продажи", jan: "12%", feb: "13%", mar: "14%", apr: "14%" },
	{ id: "margin_logistics", parentId: "margin", label: "Логистика", jan: "6%", feb: "6%", mar: "7%", apr: "6%" },
	{
		id: "margin_logistics_local",
		parentId: "margin_logistics",
		label: "Локальная логистика",
		jan: "4%",
		feb: "4%",
		mar: "5%",
		apr: "4%"
	},
	{
		id: "margin_logistics_export",
		parentId: "margin_logistics",
		label: "Экспортная логистика",
		jan: "2%",
		feb: "2%",
		mar: "2%",
		apr: "2%",
		isLocked: true
	},
	{ id: "orphan_costs", parentId: "missing_parent", label: "Прочие расходы без родителя", jan: "30", feb: "28", mar: "31", apr: "35" }
];

const demoColumns: TableColumnDef<FinancialRow>[] = [
	{
		id: "label",
		accessorKey: "label",
		header: "Показатель",
		meta: {
			width: 18,
			align: "left"
		}
	},
	{
		id: "jan",
		accessorKey: "jan",
		header: "янв",
		meta: {
			width: 8,
			align: "right"
		}
	},
	{
		id: "feb",
		accessorKey: "feb",
		header: "фев",
		meta: {
			width: 8,
			align: "right"
		}
	},
	{
		id: "mar",
		accessorKey: "mar",
		header: "мар",
		meta: {
			width: 8,
			align: "right"
		}
	},
	{
		id: "apr",
		accessorKey: "apr",
		header: "апр",
		meta: {
			width: 8,
			align: "right"
		}
	}
];

const hierarchy: TreeTableProps<FinancialRow>["hierarchy"] = {
	getRowId: (row) => row.id,
	getParentRowId: (row) => row.parentId
};

/**
 * Иерархия для formatting stories `TreeTable`.
 */
const formattingHierarchy: TreeTableProps<FinancialFormattingRow>["hierarchy"] = {
	getRowId: (row) => row.id,
	getParentRowId: (row) => row.parentId
};

const divisionTreeHierarchy: TreeTableProps<DivisionTreeRow>["hierarchy"] = {
	getRowId: (row) => row.id,
	getParentRowId: (row) => row.parentId
};

/**
 * Локальные строки для демонстрации formatting/runtime в дереве.
 */
const formattingRows: FinancialFormattingRow[] = [
	{
		id: "revenue",
		parentId: null,
		label: "Выручка",
		purchasePrice: 80,
		salePrice: 125,
		healthScore: 40,
		pendingAmount: 0,
		createdAt: "2026-03-18T09:15:00.000Z",
		totalAmount: 1820
	},
	{
		id: "revenue_domestic",
		parentId: "revenue",
		label: "Внутренний рынок",
		purchasePrice: 82,
		salePrice: 129,
		healthScore: 120,
		pendingAmount: 250,
		createdAt: "2026-03-18T10:00:00.000Z",
		totalAmount: 980
	},
	{
		id: "revenue_export",
		parentId: "revenue",
		label: "Экспорт",
		purchasePrice: 75,
		salePrice: 118,
		healthScore: 95,
		pendingAmount: 0,
		createdAt: "2026-03-19T08:25:00.000Z",
		totalAmount: 840
	},
	{
		id: "margin",
		parentId: null,
		label: "Маржинальность",
		purchasePrice: 60,
		salePrice: 90,
		healthScore: 70,
		pendingAmount: 0,
		createdAt: "2026-03-20T07:05:00.000Z",
		totalAmount: 640
	}
];

const divisionTreeRows: DivisionTreeRow[] = [
	{ id: "div-root-1", parentId: null, label: "Корень 1", division: "ДВД" },
	{ id: "div-root-2", parentId: null, label: "Корень 2", division: "ДВД" },
	{ id: "div-root-3", parentId: null, label: "Корень 3", division: "УД" },
	{ id: "div-child-1", parentId: "div-root-3", label: "Дочерний узел", division: "УД" }
];

const divisionTreeColumns: TableColumnDef<DivisionTreeRow>[] = [
	{
		id: "label",
		accessorKey: "label",
		header: "Показатель",
		meta: {
			width: 14
		}
	},
	{
		id: "division",
		accessorKey: "division",
		header: "Дивизион",
		meta: {
			width: 10,
			mergeDuplicates: true
		}
	}
];

/**
 * Строит pipeline-демо для `TreeTable` без unsupported шагов.
 */
function createFormattingPipeline(): NonNullable<
	NonNullable<TableColumnDef<FinancialFormattingRow>["meta"]>["formatting"]
>["formattersPipeline"] {
	return {
		version: 1,
		plan: {
			steps: [
				{
					id: "state",
					type: "resolveValueState",
					config: {
						resolver: {
							kind: "threshold",
							thresholds: [100],
							states: ["success", "warning"],
							invalidState: "none"
						},
						icon: {
							enabled: true,
							showValue: true,
							position: "right"
						}
					}
				},
				{
					id: "typed",
					type: "typedValueFormat"
				}
			]
		}
	};
}

/**
 * Колонки для formula-based сценария в `TreeTable`.
 */
const formulaColumns: TableColumnDef<FinancialFormattingRow>[] = [
	{
		id: "label",
		accessorKey: "label",
		header: "Показатель",
		meta: {
			width: 16
		}
	},
	{
		id: "purchasePrice",
		accessorKey: "purchasePrice",
		header: "Закупка",
		meta: {
			width: 8,
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal"
			}
		}
	},
	{
		id: "salePrice",
		accessorKey: "salePrice",
		header: "Продажа",
		meta: {
			width: 8,
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal"
			}
		}
	},
	{
		id: "markup",
		accessorFn: () => undefined,
		header: "Наценка",
		meta: {
			width: 8,
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal",
				formulaId: "markup",
				formulaDependencies: ["purchasePrice", "salePrice"],
				purelyDerived: true
			}
		}
	}
];

/**
 * Колонки для демонстрации formatting прямо в tree-колонке.
 */
const treeFormattedColumns: TableColumnDef<FinancialFormattingRow>[] = [
	{
		id: "totalAmount",
		accessorKey: "totalAmount",
		header: "Сумма в дереве",
		meta: {
			width: 12,
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal",
				formattersPipeline: createFormattingPipeline()
			}
		}
	},
	{
		id: "label",
		accessorKey: "label",
		header: "Показатель",
		meta: {
			width: 14
		}
	}
];

/**
 * Колонки для сценария со скрытием нулей.
 */
const hiddenZeroColumns: TableColumnDef<FinancialFormattingRow>[] = [
	{
		id: "label",
		accessorKey: "label",
		header: "Показатель",
		meta: {
			width: 16
		}
	},
	{
		id: "pendingAmount",
		accessorKey: "pendingAmount",
		header: "Резерв",
		meta: {
			width: 8,
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal",
				emptyWhenZero: true
			}
		}
	}
];

/**
 * Статические metadata для OData adapter story без сетевых зависимостей.
 */
const adapterMetadataColumns: EntityColumnProperty[] = [
	{
		id: "label",
		type: "string",
		originalType: "Edm.String",
		label: "Показатель",
		semanticType: "none",
		sortable: true,
		filterable: true,
		role: "dimension"
	},
	{
		id: "createdAt",
		type: "datetime",
		originalType: "Edm.DateTime",
		label: "Дата создания",
		semanticType: "none",
		sortable: true,
		filterable: true,
		role: "dimension"
	},
	{
		id: "totalAmount",
		type: "decimal",
		originalType: "Edm.Decimal",
		label: "Сумма",
		semanticType: "none",
		sortable: true,
		filterable: true,
		role: "measure"
	}
];

/**
 * Готовые колонки для storybook-демо в build-режиме OData adapter.
 */
const adapterColumns = createTableColumnsFromODataMetadata<FinancialFormattingRow>(adapterMetadataColumns);

const HOOK_ODATA_SERVICE = "ZDEMO_FINANCE_SRV";
const HOOK_ODATA_ENTITY = "FinanceSet";

/**
 * metadata для story-примеров `useODataTableColumns(...)` в TreeTable.
 */
const hookMetadata: EntityMetadata = {
	title: "Финансовая иерархия",
	columns: adapterMetadataColumns
};

/**
 * Собирает query key metadata в том же виде, что и production hook.
 */
function createODataMetadataQueryKey(service: string) {
	return ["odata", "metadata", { service }] as const;
}

/**
 * Подкладывает статическое metadata в react-query cache, чтобы TreeTable stories использовали реальный hook без fetch.
 */
const withMockedHookODataMetadata: Decorator = (storyRenderer, context) => {
	const queryClient = useMemo(() => {
		const client = createQueryClient({});
		const service = context.parameters.odataService as string | undefined;
		const entity = context.parameters.odataEntity as string | undefined;
		const metadata = context.parameters.odataMetadata as EntityMetadata | undefined;

		if (service && entity && metadata) {
			client.setQueryData<ServiceMetadata>(createODataMetadataQueryKey(service), {
				entities: {
					[entity]: metadata
				},
				functionImports: {}
			});
		}

		return client;
	}, [context.parameters.odataEntity, context.parameters.odataMetadata, context.parameters.odataService]);

	return <QueryClientProvider client={queryClient}>{storyRenderer()}</QueryClientProvider>;
};

/**
 * Демонстрирует режим `build`, когда hook сам создаёт колонки для дерева по metadata.
 */
function HookBuildTreeTableStory() {
	const { columns, metadata, isLoading } = useODataTableColumns<FinancialFormattingRow>({
		service: HOOK_ODATA_SERVICE,
		target: HOOK_ODATA_ENTITY,
		mode: "build"
	});

	return (
		<div style={{ display: "grid", gap: "0.75em" }}>
			<div>
				Режим build: hook собрал {columns.length} колонки из metadata
				{metadata ? ` для сущности «${metadata.title}».` : "."}
			</div>
			<TreeTable
				title="useODataTableColumns: build"
				data={formattingRows}
				columns={columns}
				hierarchy={formattingHierarchy}
				selectionMode="none"
				expandFirstLevel
				indentSize={1}
				isLoading={isLoading}
			/>
		</div>
	);
}

/**
 * Демонстрирует режим `enrich`, когда hook сохраняет ручные колонки дерева и дозаполняет их metadata-контекстом.
 */
function HookEnrichTreeTableStory() {
	const { columns, metadata, isLoading } = useODataTableColumns<FinancialFormattingRow>({
		service: HOOK_ODATA_SERVICE,
		target: HOOK_ODATA_ENTITY,
		mode: "enrich",
		columns: [
			{
				id: "label",
				accessorKey: "label",
				header: "Статья",
				meta: {
					width: 16
				}
			},
			{
				id: "createdAt",
				accessorKey: "createdAt",
				header: "Создано",
				meta: {
					width: 12
				}
			},
			{
				id: "totalAmount",
				accessorKey: "totalAmount",
				header: "Итог",
				meta: {
					width: 10,
					align: "right"
				}
			}
		]
	});

	return (
		<div style={{ display: "grid", gap: "0.75em" }}>
			<div>
				Режим enrich: hook сохранил ручные tree-колонки и дополнил их formatting-контекстом
				{metadata ? ` из metadata «${metadata.title}».` : "."}
			</div>
			<TreeTable
				title="useODataTableColumns: enrich"
				data={formattingRows}
				columns={columns}
				hierarchy={formattingHierarchy}
				selectionMode="none"
				expandFirstLevel
				indentSize={1}
				isLoading={isLoading}
			/>
		</div>
	);
}

const meta = {
	title: "Shared/UI/TreeTable",
	component: TreeTable as unknown as ComponentType<TreeTableProps<FinancialRow>>,
	args: {
		title: "Финансовые показатели",
		data: demoRows,
		columns: demoColumns,
		hierarchy,
		selectionMode: "single",
		expandFirstLevel: true,
		indentSize: 1
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		data: {
			description: "Плоский источник данных OData.",
			control: false
		},
		columns: {
			description: "Колонки TreeTable.",
			control: false
		},
		hierarchy: {
			description: "Функции получения id строки и id родителя.",
			control: false
		},
		title: {
			description: "Заголовок таблицы.",
			control: "text"
		},
		selectionMode: {
			description: "Режим выбора строк.",
			control: "inline-radio",
			options: ["none", "single", "multi"]
		},
		expandFirstLevel: {
			description: "Автоматически раскрывает корневой уровень при первой инициализации.",
			control: "boolean"
		},
		defaultExpandedRowIds: {
			description: "Дополнительные строки, которые должны быть раскрыты при первой инициализации.",
			control: false
		},
		treeColumnId: {
			description: "Колонка, в которой рисуется дерево.",
			control: "text"
		},
		indentSize: {
			description: "Отступ на уровень вложенности; число трактуется как em.",
			control: "number"
		},
		getRowCanSelect: {
			description: "Позволяет запретить выбор отдельных строк.",
			control: false
		},
		onRowClick: {
			description: "Вызывается при активации строки.",
			control: false
		},
		onRowSelectionChange: {
			description: "Вызывается после изменения выбранных строк.",
			control: false
		},
		onExpandedRowIdsChange: {
			description: "Вызывается после изменения раскрытых строк.",
			control: false
		},
		isLoading: {
			description: "Первичная загрузка таблицы.",
			control: "boolean"
		},
		isFetching: {
			description: "Фоновое обновление уже загруженных данных.",
			control: "boolean"
		}
	}
} satisfies Meta<TreeTableProps<FinancialRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовый сценарий дерева с раскрытием первого уровня.
 */
export const Basic: Story = {};

/**
 * Множественный выбор с отображением текущего результата.
 */
export const MultiSelect: Story = {
	render: (args) => {
		const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

		return (
			<div style={{ display: "grid", gap: "0.75em" }}>
				<div>Выбрано: {selectedLabels.length > 0 ? selectedLabels.join(", ") : "ничего"}</div>
				<TreeTable
					{...args}
					selectionMode="multi"
					onRowSelectionChange={(rows) => setSelectedLabels(rows.map((row) => row.label))}
				/>
			</div>
		);
	}
};

/**
 * Дерево остаётся свёрнутым до взаимодействия пользователя.
 */
export const CollapsedByDefault: Story = {
	args: {
		expandFirstLevel: false
	}
};

/**
 * Дополнительно раскрывает конкретную ветку при первой инициализации.
 */
export const WithDefaultExpandedBranch: Story = {
	args: {
		expandFirstLevel: false,
		defaultExpandedRowIds: ["margin", "margin_logistics"]
	}
};

/**
 * Часть строк можно показать, но запретить выбирать.
 */
export const WithDisabledRows: Story = {
	args: {
		selectionMode: "multi",
		getRowCanSelect: (row) => !row.isLocked
	},
	render: (args) => {
		const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

		return (
			<div style={{ display: "grid", gap: "0.75em" }}>
				<div>Строка «Экспортная логистика» остаётся в дереве, но не участвует в выборе.</div>
				<div>Выбрано: {selectedLabels.length > 0 ? selectedLabels.join(", ") : "ничего"}</div>
				<TreeTable {...args} onRowSelectionChange={(rows) => setSelectedLabels(rows.map((row) => row.label))} />
			</div>
		);
	}
};

/**
 * Сценарий фонового обновления данных без очистки дерева.
 */
export const Fetching: Story = {
	args: {
		isFetching: true
	}
};

/**
 * Пустой источник данных.
 */
export const Empty: Story = {
	args: {
		data: []
	}
};

/**
 * Состояние первичной загрузки.
 */
export const Loading: Story = {
	args: {
		isLoading: true
	}
};

/**
 * Сценарий с formula-based колонкой в древовидной таблице.
 */
export const WithFormulaColumn: Story = {
	render: () => (
		<TreeTable
			title="Формула в дереве"
			data={formattingRows}
			columns={formulaColumns}
			hierarchy={formattingHierarchy}
			selectionMode="none"
			expandFirstLevel
			indentSize={1}
		/>
	)
};

/**
 * Сценарий, где formatting применяется прямо в tree-колонке.
 */
export const WithFormattedTreeColumn: Story = {
	render: () => (
		<TreeTable
			title="Форматирование tree-колонки"
			data={formattingRows}
			columns={treeFormattedColumns}
			hierarchy={formattingHierarchy}
			treeColumnId="totalAmount"
			selectionMode="none"
			expandFirstLevel
			indentSize={1}
		/>
	)
};

/**
 * Сценарий со скрытием нулевых значений в дереве.
 */
export const WithHiddenZero: Story = {
	render: () => (
		<TreeTable
			title="Скрытие нулей в дереве"
			data={formattingRows}
			columns={hiddenZeroColumns}
			hierarchy={formattingHierarchy}
			selectionMode="none"
			expandFirstLevel
			indentSize={1}
		/>
	)
};

/**
 * Сценарий со слиянием дубликатов на одной глубине в `TreeTable`.
 */
export const WithMergedDuplicates: Story = {
	render: () => (
		<TreeTable
			title="Слияние дубликатов в дереве"
			data={divisionTreeRows}
			columns={divisionTreeColumns}
			hierarchy={divisionTreeHierarchy}
			selectionMode="none"
			expandFirstLevel
			indentSize={1}
		/>
	)
};

/**
 * Сценарий со статическим OData metadata adapter в build-режиме.
 */
export const WithODataMetadataAdapter: Story = {
	render: () => (
		<TreeTable
			title="OData metadata adapter"
			data={formattingRows}
			columns={adapterColumns}
			hierarchy={formattingHierarchy}
			selectionMode="none"
			expandFirstLevel
			indentSize={1}
		/>
	)
};

/**
 * Реальный hook-сценарий `useODataTableColumns(...)` в режиме build для TreeTable.
 */
export const WithUseODataTableColumnsBuildHook: Story = {
	decorators: [withMockedHookODataMetadata],
	parameters: {
		odataService: HOOK_ODATA_SERVICE,
		odataEntity: HOOK_ODATA_ENTITY,
		odataMetadata: hookMetadata
	},
	render: () => <HookBuildTreeTableStory />
};

/**
 * Реальный hook-сценарий `useODataTableColumns(...)` в режиме enrich для TreeTable.
 */
export const WithUseODataTableColumnsEnrichHook: Story = {
	decorators: [withMockedHookODataMetadata],
	parameters: {
		odataService: HOOK_ODATA_SERVICE,
		odataEntity: HOOK_ODATA_ENTITY,
		odataMetadata: hookMetadata
	},
	render: () => <HookEnrichTreeTableStory />
};
