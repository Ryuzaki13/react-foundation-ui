import { useState } from "react";

import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { DEFAULT_LAYOUT_PICKER_PRESETS, LayoutPicker, type LayoutPickerPreset, type LayoutPickerProps } from "../index";

import styles from "./LayoutPicker.stories.module.scss";

import type { Meta, StoryObj } from "@storybook/react-vite";

const dashboardPresets = [
	{
		id: "dashboard-summary",
		label: "Сводка + детали",
		description: "Один широкий блок сверху и две области детализации снизу.",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "summary", column: 1, columnSpan: 2, row: 1, rowSpan: 1 },
			{ id: "left-detail", column: 1, columnSpan: 1, row: 2, rowSpan: 1 },
			{ id: "right-detail", column: 2, columnSpan: 1, row: 2, rowSpan: 1 }
		]
	},
	{
		id: "dashboard-main-aside",
		label: "Основной блок + сайдбар",
		description: "Большая рабочая область слева и вертикальная колонка справа.",
		columns: 3,
		rows: 2,
		cells: [
			{ id: "main", column: 1, columnSpan: 2, row: 1, rowSpan: 2 },
			{ id: "aside-top", column: 3, columnSpan: 1, row: 1, rowSpan: 1 },
			{ id: "aside-bottom", column: 3, columnSpan: 1, row: 2, rowSpan: 1 }
		]
	},
	{
		id: "dashboard-quad",
		label: "Четыре равных блока",
		description: "Плотная сетка для сравнения нескольких независимых виджетов.",
		columns: 2,
		rows: 2,
		cells: [
			{ id: "top-left", column: 1, columnSpan: 1, row: 1, rowSpan: 1 },
			{ id: "top-right", column: 2, columnSpan: 1, row: 1, rowSpan: 1 },
			{ id: "bottom-left", column: 1, columnSpan: 1, row: 2, rowSpan: 1 },
			{ id: "bottom-right", column: 2, columnSpan: 1, row: 2, rowSpan: 1 }
		]
	}
] as const satisfies readonly LayoutPickerPreset[];

function findPreset(value: string, presets: readonly LayoutPickerPreset[]): LayoutPickerPreset | undefined {
	return presets.find((preset) => preset.id === value);
}

function PresetSummary({ value, presets }: { value: string; presets: readonly LayoutPickerPreset[] }) {
	const selectedPreset = findPreset(value, presets);

	return (
		<div className={styles.summary} aria-live="polite">
			<div className={styles.summaryItem}>
				<span>ID</span>
				<span className={styles.summaryValue}>{value || "не выбрано"}</span>
			</div>
			<div className={styles.summaryItem}>
				<span>Название</span>
				<span className={styles.summaryValue}>{selectedPreset?.label ?? "Layout не выбран"}</span>
			</div>
			<div className={styles.summaryItem}>
				<span>Сетка</span>
				<span className={styles.summaryValue}>
					{selectedPreset ? `${selectedPreset.columns} x ${selectedPreset.rows}` : "нет данных"}
				</span>
			</div>
			<div className={styles.summaryItem}>
				<span>Ячеек</span>
				<span className={styles.summaryValue}>{selectedPreset?.cells.length ?? 0}</span>
			</div>
		</div>
	);
}

function LayoutPreview({ value, presets }: { value: string; presets: readonly LayoutPickerPreset[] }) {
	const selectedPreset = findPreset(value, presets);
	if (!selectedPreset) return null;

	const columns = selectedPreset.columns;
	const rows = selectedPreset.rows;
	const cells = selectedPreset.cells;

	return (
		<div
			className={styles.layoutPreview}
			style={{
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
			}}>
			{cells.map((cell, index) => (
				<div
					key={cell.id}
					className={styles.layoutCell}
					style={{
						gridColumn: `${cell.column} / span ${cell.columnSpan}`,
						gridRow: `${cell.row} / span ${cell.rowSpan}`
					}}>
					<span className={styles.layoutCellTitle}>Область {index + 1}</span>
					<span className={styles.muted}>
						Колонка {cell.column}, строка {cell.row}; span {cell.columnSpan} x {cell.rowSpan}
					</span>
				</div>
			))}
		</div>
	);
}

function ControlledExample() {
	const [value, setValue] = useState("1x2");

	return (
		<div className={styles.canvas}>
			<div className={styles.toolbar}>
				<LayoutPicker label="Layout панели" value={value} onChange={setValue} ariaLabel="Выбрать layout панели" />
			</div>
			<PresetSummary value={value} presets={DEFAULT_LAYOUT_PICKER_PRESETS} />
			<LayoutPreview value={value} presets={DEFAULT_LAYOUT_PICKER_PRESETS} />
		</div>
	);
}

const meta = {
	title: "Shared/UI/LayoutPicker",
	component: LayoutPicker,
	args: {
		label: "Layout панели",
		description: "Выберите схему размещения областей.",
		value: DEFAULT_LAYOUT_PICKER_PRESETS[0].id,
		onChange: fn<(value: string) => void>(),
		presets: DEFAULT_LAYOUT_PICKER_PRESETS,
		disabled: false,
		placeholder: "Выберите layout",
		showPlaceholder: false,
		ariaLabel: "Выбрать layout",
		placement: "bottom-start"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		docs: {
			description: {
				component:
					"Контролируемый выбор layout-пресета со схематичным превью. Компонент хранит только UI-состояние popup и возвращает наружу ID выбранного пресета."
			}
		}
	},
	argTypes: {
		id: {
			description: "ID кнопки выбора. Если не передан, компонент создаёт стабильный `useId`.",
			control: "text"
		},
		label: {
			description: "Заголовок поля.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		value: {
			description: "ID текущего выбранного layout-пресета.",
			control: "text"
		},
		onChange: {
			description: "Вызывается с ID выбранного layout-пресета.",
			control: false
		},
		presets: {
			description: "Список layout-пресетов. По умолчанию используется `DEFAULT_LAYOUT_PICKER_PRESETS`.",
			control: false
		},
		disabled: {
			description: "Блокирует кнопку выбора и открытие popup.",
			control: "boolean"
		},
		getPresetDisabled: {
			description: "Позволяет заблокировать отдельные пресеты внутри popup.",
			control: false
		},
		placeholder: {
			description: "Текст, который можно явно показать рядом с превью через `showPlaceholder`.",
			control: "text"
		},
		showPlaceholder: {
			description: "Показывает рядом с превью именно строку `placeholder`. По умолчанию trigger содержит только иконку.",
			control: "boolean"
		},
		ariaLabel: {
			description: "Доступное имя trigger-кнопки. Если не передано, строится из текущего значения.",
			control: "text"
		},
		size: {
			description: "Размер поля из общего `UiBaseProps`.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		className: {
			description: "Дополнительный CSS-класс корневого контейнера.",
			control: "text"
		},
		triggerClassName: {
			description: "Дополнительный CSS-класс trigger-кнопки.",
			control: "text"
		},
		popupClassName: {
			description: "Дополнительный CSS-класс popup.",
			control: "text"
		},
		placement: {
			description: "Позиционирование popup относительно trigger.",
			control: "select",
			options: ["bottom-start", "bottom-end", "top-start", "top-end", "right-start", "left-start"]
		}
	}
} satisfies Meta<typeof LayoutPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	args: {
		value: "2x1"
	},

	name: "Контролируемый выбор",

	render: function Render(args) {
		const [, updateArgs] = useArgs<LayoutPickerProps>();
		const presets = args.presets ?? DEFAULT_LAYOUT_PICKER_PRESETS;

		return (
			<div className={styles.canvas}>
				<LayoutPicker
					{...args}
					presets={presets}
					onChange={(layoutId) => {
						args.onChange(layoutId);
						updateArgs({ value: layoutId });
					}}
				/>
				<PresetSummary value={args.value ?? ""} presets={presets} />
			</div>
		);
	}
};

export const Placeholder: Story = {
	name: "Без выбранного значения",
	render: (args) => {
		const [value, setValue] = useState("");
		const presets = args.presets ?? DEFAULT_LAYOUT_PICKER_PRESETS;

		return (
			<div className={styles.canvas}>
				<LayoutPicker
					{...args}
					value={value}
					presets={presets}
					placeholder="Layout ещё не выбран"
					showPlaceholder
					onChange={(layoutId) => {
						setValue(layoutId);
						args.onChange(layoutId);
					}}
				/>
				<PresetSummary value={value} presets={presets} />
			</div>
		);
	},
	args: {
		value: ""
	}
};

export const CustomPresets: Story = {
	name: "Кастомные пресеты",
	render: (args) => {
		const [value, setValue] = useState<string>(dashboardPresets[0].id);

		return (
			<div className={styles.canvas}>
				<LayoutPicker
					{...args}
					value={value}
					presets={dashboardPresets}
					ariaLabel="Выбрать layout дашборда"
					onChange={(layoutId) => {
						setValue(layoutId);
						args.onChange(layoutId);
					}}
				/>
				<PresetSummary value={value} presets={dashboardPresets} />
				<LayoutPreview value={value} presets={dashboardPresets} />
			</div>
		);
	},
	args: {
		value: dashboardPresets[0].id,
		presets: dashboardPresets
	}
};

export const DisabledPresets: Story = {
	name: "Заблокированные пресеты",
	render: (args) => {
		const [value, setValue] = useState("1x1");

		return (
			<div className={styles.canvas}>
				<LayoutPicker
					{...args}
					value={value}
					getPresetDisabled={(preset) => preset.id === "1x2" || preset.id === "2x2-l"}
					onChange={(layoutId) => {
						setValue(layoutId);
						args.onChange(layoutId);
					}}
				/>
				<div className={styles.muted}>Пресеты с двумя колонками в этом сценарии недоступны.</div>
				<PresetSummary value={value} presets={DEFAULT_LAYOUT_PICKER_PRESETS} />
			</div>
		);
	}
};

export const InToolbar: Story = {
	name: "В панели настройки",
	render: () => <ControlledExample />
};

export const Disabled: Story = {
	name: "Заблокированный контрол",
	args: {
		disabled: true,
		value: "1x2"
	}
};
