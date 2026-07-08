import { useMemo, useState, type ComponentType } from "react";

import { useODataTableColumns } from "@ryuzaki13/react-foundation-api/odata";
import { createQueryClient } from "@ryuzaki13/react-foundation-lib/query-client";
import { enrichTableColumnsWithODataFormatting, type TableColumnDef } from "@ryuzaki13/react-foundation-lib/table";
import { QueryClientProvider } from "@tanstack/react-query";

import { Table, type TableProps } from "../Table";

import type { EntityColumnProperty, EntityMetadata, ServiceMetadata } from "@ryuzaki13/react-foundation-lib/odata-service";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

interface DealRow {
	id: string;
	number: string;
	client: string;
	manager: string;
	amount: string;
	status: string;
	isLocked?: boolean;
}

/**
 * Данные для демонстрации formula/pipeline/runtime-сценариев.
 */
interface DealFormattingRow {
	id: string;
	product: string;
	purchasePrice: number;
	salePrice: number;
	healthScore: number;
	pendingAmount: number;
	createdAt: string;
	totalAmount: number;
}

interface DivisionMergeRow {
	id: string;
	division: string;
	department: string;
	employee: string;
}

const demoRows: DealRow[] = [
	{ id: "1", number: "450001", client: "Северсталь", manager: "Иван Петров", amount: "1 250 000", status: "Новая" },
	{ id: "2", number: "450002", client: "ММК", manager: "Анна Смирнова", amount: "980 000", status: "В работе" },
	{ id: "3", number: "450003", client: "НЛМК", manager: "Олег Николаев", amount: "1 540 000", status: "Согласование" },
	{ id: "4", number: "450004", client: "ЕВРАЗ", manager: "Мария Кузнецова", amount: "760 000", status: "Отгружена" },
	{ id: "5", number: "450005", client: "ТМК", manager: "Дмитрий Волков", amount: "1 120 000", status: "Закрыта" }
];

const nonSelectableRows: DealRow[] = [
	...demoRows,
	{
		id: "6",
		number: "450006",
		client: "ОМК",
		manager: "Елена Андреева",
		amount: "680 000",
		status: "Архив",
		isLocked: true
	}
];

const reachEndRows: DealRow[] = Array.from({ length: 18 }, (_, index) => ({
	id: String(index + 1),
	number: `4600${String(index + 1).padStart(2, "0")}`,
	client: `Клиент ${index + 1}`,
	manager: `Менеджер ${index + 1}`,
	amount: `${850 + index * 15} 000`,
	status: index % 2 === 0 ? "В работе" : "Согласование"
}));

const demoColumns: TableColumnDef<DealRow>[] = [
	{
		id: "number",
		accessorKey: "number",
		header: "Номер",
		meta: {
			width: 9
		}
	},
	{
		id: "client",
		accessorKey: "client",
		header: "Клиент",
		meta: {
			width: 14
		}
	},
	{
		id: "manager",
		accessorKey: "manager",
		header: "Менеджер",
		meta: {
			width: 12
		}
	},
	{
		id: "amount",
		accessorKey: "amount",
		header: "Сумма",
		meta: {
			width: 10,
			align: "right"
		}
	},
	{
		id: "status",
		accessorKey: "status",
		header: "Статус",
		meta: {
			width: 11
		}
	}
];

/**
 * Локальный набор строк для stories с formatting-runtime.
 */
const formattingRows: DealFormattingRow[] = [
	{
		id: "fmt-1",
		product: "Лист горячекатаный",
		purchasePrice: 80,
		salePrice: 120,
		healthScore: 35,
		pendingAmount: 0,
		createdAt: "2026-03-18T09:15:00.000Z",
		totalAmount: 1520.5
	},
	{
		id: "fmt-2",
		product: "Рулон оцинкованный",
		purchasePrice: 95,
		salePrice: 150,
		healthScore: 125,
		pendingAmount: 320,
		createdAt: "2026-03-19T11:40:00.000Z",
		totalAmount: 2140
	},
	{
		id: "fmt-3",
		product: "Арматура",
		purchasePrice: 60,
		salePrice: 90,
		healthScore: 70,
		pendingAmount: 0,
		createdAt: "2026-03-20T07:05:00.000Z",
		totalAmount: 980.75
	}
];

const divisionMergeRows: DivisionMergeRow[] = [
	{ id: "merge-1", division: "ДВД", department: "Продажи", employee: "Иван Петров" },
	{ id: "merge-2", division: "ДВД", department: "Продажи", employee: "Анна Смирнова" },
	{ id: "merge-3", division: "ДВД", department: "Продажи", employee: "Олег Николаев" },
	{ id: "merge-4", division: "УД", department: "Логистика", employee: "Мария Кузнецова" },
	{ id: "merge-5", division: "УД", department: "Логистика", employee: "Дмитрий Волков" },
	{ id: "merge-6", division: "УД", department: "Логистика", employee: "Елена Андреева" },
	{ id: "merge-7", division: "УД", department: "Логистика", employee: "Николай Орлов" }
];

const divisionMergeColumns: TableColumnDef<DivisionMergeRow>[] = [
	{
		id: "division",
		accessorKey: "division",
		header: "Дивизион",
		meta: {
			width: 10,
			mergeDuplicates: true
		}
	},
	{
		id: "department",
		accessorKey: "department",
		header: "Подразделение",
		meta: {
			width: 12
		}
	},
	{
		id: "employee",
		accessorKey: "employee",
		header: "Сотрудник",
		meta: {
			width: 14
		}
	}
];

/**
 * Строит pipeline-демо с value-state и typed formatting без unsupported шагов.
 */
function createFormattingPipeline(): NonNullable<
	NonNullable<TableColumnDef<DealFormattingRow>["meta"]>["formatting"]
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
 * Колонки для сценария с formula-based ячейкой.
 */
const formulaColumns: TableColumnDef<DealFormattingRow>[] = [
	{
		id: "product",
		accessorKey: "product",
		header: "Товар",
		meta: {
			width: 16
		}
	},
	{
		id: "purchasePrice",
		accessorKey: "purchasePrice",
		header: "Закупка",
		meta: {
			width: 9,
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
			width: 9,
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
			width: 9,
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
 * Колонки для сценария с pipeline-форматированием состояния.
 */
const pipelineColumns: TableColumnDef<DealFormattingRow>[] = [
	{
		id: "product",
		accessorKey: "product",
		header: "Товар",
		meta: {
			width: 16
		}
	},
	{
		id: "healthScore",
		accessorKey: "healthScore",
		header: "Индекс риска",
		meta: {
			width: 10,
			align: "right",
			formatting: {
				role: "measure",
				type: "decimal",
				formattersPipeline: createFormattingPipeline()
			}
		}
	}
];

/**
 * Колонки для сценария со скрытием нулей.
 */
const hiddenZeroColumns: TableColumnDef<DealFormattingRow>[] = [
	{
		id: "product",
		accessorKey: "product",
		header: "Товар",
		meta: {
			width: 16
		}
	},
	{
		id: "pendingAmount",
		accessorKey: "pendingAmount",
		header: "Резерв",
		meta: {
			width: 9,
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
 * Статические OData metadata для примера enrich adapter без сетевых вызовов.
 */
const adapterMetadataColumns: EntityColumnProperty[] = [
	{
		id: "product",
		type: "string",
		originalType: "Edm.String",
		label: "Товар",
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
 * Ручные колонки для демонстрации enrich-режима OData adapter.
 */
const adapterManualColumns: TableColumnDef<DealFormattingRow>[] = [
	{
		id: "product",
		accessorKey: "product",
		header: "Позиция",
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
			width: 9,
			align: "right"
		}
	}
];

/**
 * Результат enrich-режима OData adapter для storybook-демо.
 */
const adapterColumns = enrichTableColumnsWithODataFormatting(adapterManualColumns, adapterMetadataColumns);

const HOOK_ODATA_SERVICE = "ZDEMO_DEALS_SRV";
const HOOK_ODATA_ENTITY = "DealSet";

/**
 * metadata для story-примеров, которые используют реальный `useODataTableColumns(...)`.
 */
const hookMetadata: EntityMetadata = {
	title: "Портфель сделок",
	columns: adapterMetadataColumns
};

/**
 * Собирает query key metadata в том же виде, что и production hook.
 */
function createODataMetadataQueryKey(service: string) {
	return ["odata", "metadata", { service }] as const;
}

/**
 * Подкладывает статическое metadata в react-query cache, чтобы story использовала реальный hook без fetch.
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
 * Демонстрирует режим `build`, когда hook сам строит колонки только по OData metadata.
 */
function HookBuildTableStory() {
	const { columns, metadata, isLoading } = useODataTableColumns<DealFormattingRow>({
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
			<Table
				title="useODataTableColumns: build"
				data={formattingRows}
				columns={columns}
				selectionMode="none"
				isLoading={isLoading}
				getRowId={(row) => row.id}
			/>
		</div>
	);
}

/**
 * Демонстрирует режим `enrich`, когда hook дозаполняет вручную описанные колонки metadata-контекстом.
 */
function HookEnrichTableStory() {
	const { columns, metadata, isLoading } = useODataTableColumns<DealFormattingRow>({
		service: HOOK_ODATA_SERVICE,
		target: HOOK_ODATA_ENTITY,
		mode: "enrich",
		columns: adapterManualColumns
	});

	return (
		<div style={{ display: "grid", gap: "0.75em" }}>
			<div>
				Режим enrich: hook сохранил ручные заголовки и дополнил formatting-контекст
				{metadata ? ` из metadata «${metadata.title}».` : "."}
			</div>
			<Table
				title="useODataTableColumns: enrich"
				data={formattingRows}
				columns={columns}
				selectionMode="none"
				isLoading={isLoading}
				getRowId={(row) => row.id}
			/>
		</div>
	);
}

const meta = {
	title: "Shared/UI/Table",
	component: Table as unknown as ComponentType<TableProps<DealRow>>,
	args: {
		title: "Сделки",
		data: demoRows,
		columns: demoColumns,
		getRowId: (row) => row.id,
		selectionMode: "single"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		data: {
			description: "Плоский источник данных.",
			control: false
		},
		columns: {
			description: "Колонки таблицы.",
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
		getRowId: {
			description: "Функция получения стабильного id строки.",
			control: false
		},
		columnPinning: {
			description: "Controlled-состояние закрепления колонок слева.",
			control: false
		},
		defaultColumnPinning: {
			description: "Стартовое uncontrolled-состояние закрепления колонок слева.",
			control: false
		},
		onColumnPinningChange: {
			description: "Вызывается после изменения закрепления колонок слева.",
			control: false
		},
		getRowCanSelect: {
			description: "Позволяет запретить выбор отдельных строк.",
			control: false
		},
		getRowClassName: {
			description: "Позволяет добавить CSS-класс для конкретной строки.",
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
		onReachEnd: {
			description: "Вызывается при достижении конца списка внутри scroll-контейнера.",
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
} satisfies Meta<TableProps<DealRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовый сценарий плоской таблицы с одиночным выбором.
 */
export const Basic: Story = {};

/**
 * Демонстрирует controlled left-pinning через внешний story-state без встроенного UI таблицы.
 */
export const WithColumnPinning: Story = {
	render: (args) => {
		const [columnPinning, setColumnPinning] = useState<{ left?: string[] }>({
			left: ["number"]
		});

		return (
			<div style={{ display: "grid", gap: "0.75em" }}>
				<div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap" }}>
					<button type="button" onClick={() => setColumnPinning({ left: ["number"] })}>
						Закрепить «Номер»
					</button>
					<button type="button" onClick={() => setColumnPinning({ left: ["number", "client"] })}>
						Закрепить «Номер» и «Клиент»
					</button>
					<button type="button" onClick={() => setColumnPinning({ left: [] })}>
						Снять закрепление
					</button>
				</div>
				<div>Закреплено слева: {columnPinning.left?.length ? columnPinning.left.join(", ") : "ничего"}</div>
				<Table {...args} columnPinning={columnPinning} onColumnPinningChange={setColumnPinning} />
			</div>
		);
	}
};

/**
 * Множественный выбор с отображением текущего результата.
 */
export const MultiSelect: Story = {
	render: (args) => {
		const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

		return (
			<div style={{ display: "grid", gap: "0.75em" }}>
				<div>Выбрано: {selectedNumbers.length > 0 ? selectedNumbers.join(", ") : "ничего"}</div>
				<Table {...args} selectionMode="multi" onRowSelectionChange={(rows) => setSelectedNumbers(rows.map((row) => row.number))} />
			</div>
		);
	}
};

/**
 * Часть строк можно показать, но запретить выбирать.
 */
export const WithDisabledRows: Story = {
	args: {
		data: nonSelectableRows,
		selectionMode: "multi",
		getRowCanSelect: (row) => !row.isLocked
	},
	render: (args) => {
		const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

		return (
			<div style={{ display: "grid", gap: "0.75em" }}>
				<div>Строка со статусом «Архив» остаётся видимой, но не участвует в выборе.</div>
				<div>Выбрано: {selectedNumbers.length > 0 ? selectedNumbers.join(", ") : "ничего"}</div>
				<Table {...args} onRowSelectionChange={(rows) => setSelectedNumbers(rows.map((row) => row.number))} />
			</div>
		);
	}
};

/**
 * Сценарий фонового обновления данных без очистки таблицы.
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
 * Демонстрация callback при достижении конца списка.
 */
export const ReachEnd: Story = {
	args: {
		data: reachEndRows
	},
	render: (args) => {
		const [reachEndCount, setReachEndCount] = useState(0);

		return (
			<div style={{ display: "grid", gap: "0.75em" }}>
				<div>Событие достижения конца: {reachEndCount}</div>
				<Table {...args} onReachEnd={() => setReachEndCount((current) => current + 1)} />
			</div>
		);
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
 * Сценарий с formula-based колонкой без кастомного `cell`.
 */
export const WithFormulaColumn: Story = {
	render: () => (
		<Table title="Формула наценки" data={formattingRows} columns={formulaColumns} selectionMode="none" getRowId={(row) => row.id} />
	)
};

/**
 * Сценарий с pipeline display-formatting и value-state.
 */
export const WithFormattingPipeline: Story = {
	render: () => (
		<Table
			title="Pipeline форматирования"
			data={formattingRows}
			columns={pipelineColumns}
			selectionMode="none"
			getRowId={(row) => row.id}
		/>
	)
};

/**
 * Сценарий со скрытием нулевых значений через `emptyWhenZero`.
 */
export const WithHiddenZero: Story = {
	render: () => (
		<Table title="Скрытие нулей" data={formattingRows} columns={hiddenZeroColumns} selectionMode="none" getRowId={(row) => row.id} />
	)
};

/**
 * Сценарий со display-only слиянием подряд идущих дубликатов через пустые ячейки и CSS-склейку.
 */
export const WithMergedDuplicates: Story = {
	render: () => (
		<Table
			title="Слияние дубликатов"
			data={divisionMergeRows}
			columns={divisionMergeColumns}
			selectionMode="none"
			getRowId={(row) => row.id}
		/>
	)
};

/**
 * Сценарий со статическим OData metadata adapter в режиме enrich.
 */
export const WithODataMetadataAdapter: Story = {
	render: () => (
		<Table
			title="OData metadata adapter"
			data={formattingRows}
			columns={adapterColumns}
			selectionMode="none"
			getRowId={(row) => row.id}
		/>
	)
};

/**
 * Реальный hook-сценарий `useODataTableColumns(...)` в режиме build.
 */
export const WithUseODataTableColumnsBuildHook: Story = {
	decorators: [withMockedHookODataMetadata],
	parameters: {
		odataService: HOOK_ODATA_SERVICE,
		odataEntity: HOOK_ODATA_ENTITY,
		odataMetadata: hookMetadata
	},
	render: () => <HookBuildTableStory />
};

/**
 * Реальный hook-сценарий `useODataTableColumns(...)` в режиме enrich.
 */
export const WithUseODataTableColumnsEnrichHook: Story = {
	decorators: [withMockedHookODataMetadata],
	parameters: {
		odataService: HOOK_ODATA_SERVICE,
		odataEntity: HOOK_ODATA_ENTITY,
		odataMetadata: hookMetadata
	},
	render: () => <HookEnrichTableStory />
};
