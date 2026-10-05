import { useRef, useState } from "react";

import { type ReadFileAsDataUrlResult, type ReadImageResult } from "@ryuzaki13/react-foundation-lib/file";
import { NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";
import { type State } from "@ryuzaki13/react-foundation-lib/types";
import { type Meta, type StoryObj } from "@storybook/react-vite";

import { RangeDateInput, SingleDateInput } from "../../date-input";
import { DateRangePresetSelect, type DateRangePresetOption } from "../../date-range-preset-select";
import { SingleDateTimeInput } from "../../date-time-input";
import { InputText } from "../../input";
import { InputDateTime } from "../../input-date-time";
import { InputFile } from "../../input-file";
import { InputFiles } from "../../input-files";
import { InputImage } from "../../input-image";
import { InputSearch } from "../../input-search";
import { LayoutPicker } from "../../layout-picker";
import { MultiSelect } from "../../multi-select";
import { Option, OptionContent } from "../../option";
import { Section } from "../../panel";
import { PeriodSelect } from "../../period-select";
import { PickerField, PickerPopup, PickerTrigger, usePickerFloatingListbox, usePickerTriggerController } from "../../picker";
import { PresetSelect } from "../../preset-select";
import { Select } from "../../select";
import { SliderInput } from "../../slider";
import { StateSelect } from "../../state-select";
import { Textarea } from "../../textarea";
import { TreeSelect, type TreeSelectNode, type TreeSelectValue } from "../../tree-select";

import styles from "./ComponentGallery.module.scss";

const options = ["Первый вариант", "Второй вариант", "Третий вариант"];
const presets = [
	{ id: "compact", label: "Компактный" },
	{ id: "comfortable", label: "Свободный" },
	{ id: "detailed", label: "Подробный" }
];
const treeNodes: TreeSelectNode[] = [
	{
		id: "section-main",
		codeKey: "section",
		value: "main",
		label: "Основной раздел",
		searchText: "Основной раздел",
		children: [
			{ id: "item-first", codeKey: "item", value: "first", label: "Первый пункт", searchText: "Первый пункт" },
			{ id: "item-second", codeKey: "item", value: "second", label: "Второй пункт", searchText: "Второй пункт" }
		]
	},
	{ id: "section-extra", codeKey: "section", value: "extra", label: "Дополнительный раздел", searchText: "Дополнительный раздел" }
];

const meta = {
	title: "Development/2. Поля ввода и выбор",
	parameters: {
		atomicCanvas: true,
		layout: "fullscreen",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Интерактивная витрина input, picker, select и textarea с вложенными специализированными компонентами. Поля независимы: изменение одного примера не сбрасывает соседние."
			}
		}
	}
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Локальное состояние сохраняет обычное поведение каждого контрола в общей
 * витрине. Фиксированные даты делают календарные примеры воспроизводимыми.
 */
export const All: Story = {
	name: "Все компоненты",
	render: function Render() {
		const [text, setText] = useState("Пример значения");
		const [date, setDate] = useState<Date | null>(() => new Date(2026, 9, 4));
		const [dateRange, setDateRange] = useState<NullableDateRange | null>(null);
		const [dateTime, setDateTime] = useState<Date | null>(() => new Date(2026, 9, 4, 10, 30));
		const [maskedDateTime, setMaskedDateTime] = useState<Date | undefined>(() => new Date(2026, 9, 4, 14, 15));
		const [file, setFile] = useState<ReadFileAsDataUrlResult | undefined>();
		const [files, setFiles] = useState<ReadFileAsDataUrlResult[]>([]);
		const [image, setImage] = useState<ReadImageResult | undefined>();
		const [fileError, setFileError] = useState<string>();
		const [filesError, setFilesError] = useState<string>();
		const [imageError, setImageError] = useState<string>();
		const [search, setSearch] = useState("");
		const [pickerValue, setPickerValue] = useState<string | undefined>(options[0]);
		const [pickerOpen, setPickerOpen] = useState(false);
		const pickerInputRef = useRef<HTMLInputElement | null>(null);
		const [layout, setLayout] = useState("1x2");
		const [multiple, setMultiple] = useState<string[]>([options[0]]);
		const [slider, setSlider] = useState(40);
		const [selected, setSelected] = useState<string | undefined>(options[0]);
		const [period, setPeriod] = useState<string | undefined>("week");
		const [preset, setPreset] = useState<string | undefined>("comfortable");
		const [rangePreset, setRangePreset] = useState<DateRangePresetOption["id"] | undefined>("monthStartToToday");
		const [state, setState] = useState<State | undefined>("information");
		const [treeValue, setTreeValue] = useState<TreeSelectValue | undefined>({ codeKey: "item", value: "first" });
		const [textarea, setTextarea] = useState("Многострочный текст можно редактировать прямо в этой витрине.");
		const picker = usePickerFloatingListbox({
			options,
			selectedIndex: options.findIndex((option) => option === pickerValue),
			open: pickerOpen,
			onOpenChange: setPickerOpen,
			onSelect: setPickerValue,
			triggerMode: "display"
		});
		const pickerTrigger = usePickerTriggerController({
			mode: "display",
			open: pickerOpen,
			currentQuery: "",
			hasDisplayValue: pickerValue !== undefined,
			inputRef: pickerInputRef,
			openList: picker.openList,
			close: picker.close,
			toggleOpen: picker.toggleOpen
		});

		return (
			<div className={styles.gallery}>
				<Section title="Input" description="Текст, дата и время, файлы и поиск." className={styles.section}>
					<InputText required label="input · InputText" value={text} onChange={setText} onClear={() => setText("")} />
					<SingleDateInput label="date-input · SingleDateInput" value={date} onChange={setDate} />
					<RangeDateInput label="date-input · RangeDateInput" value={dateRange} onChange={setDateRange} />
					<SingleDateTimeInput label="date-time-input · SingleDateTimeInput" value={dateTime} onChange={setDateTime} />
					<InputDateTime
						label="input-date-time · InputDateTime"
						value={maskedDateTime}
						onChange={setMaskedDateTime}
						onClear={() => setMaskedDateTime(undefined)}
					/>
					<InputFile
						label="input-file · InputFile"
						placeholder="Выберите один файл"
						readMode="data-url"
						value={file}
						onChange={setFile}
						onClear={() => setFile(undefined)}
						error={fileError}
						onClearError={() => setFileError(undefined)}
						onReadError={(error) => setFileError(error.message)}
					/>
					<InputFiles
						label="input-files · InputFiles"
						placeholder="Выберите несколько файлов"
						readMode="data-url"
						value={files}
						onChange={setFiles}
						error={filesError}
						onClearError={() => setFilesError(undefined)}
						onReadError={(error) => setFilesError(error.message)}
					/>
					<InputImage
						label="input-image · InputImage"
						value={image}
						onChange={setImage}
						onClear={() => setImage(undefined)}
						error={imageError}
						onClearError={() => setImageError(undefined)}
						onReadError={(error) => setImageError(error.message)}
					/>
					<InputSearch
						label="input-search · InputSearch"
						description="Подтвердите поисковый запрос клавишей Enter или выходом из поля."
						value={search}
						onChange={setSearch}
					/>
				</Section>

				<Section title="Picker" description="Общий picker и специализированные способы выбора." className={styles.section}>
					{/* Модуль picker предоставляет композицию примитивов, а не отдельный монолитный Picker. */}
					<PickerField label="picker · PickerField + PickerTrigger + PickerPopup">
						{({ controlId, labelId, describedBy }) => {
							const listId = `${controlId}-listbox`;

							return (
								<>
									<PickerTrigger
										ref={pickerInputRef}
										rootRef={picker.setReference}
										id={controlId}
										type="text"
										readOnly
										role="combobox"
										open={pickerOpen}
										optionCount={options.length}
										value={pickerValue ?? ""}
										placeholder="Выберите вариант"
										clearable
										hasSelection={pickerValue !== undefined}
										showSelectedValue={false}
										onClear={() => {
											setPickerValue(undefined);
											picker.close();
										}}
										onToggleMouseDown={pickerTrigger.handleToggleMouseDown}
										onToggleClick={pickerTrigger.handleToggleClick}
										onClick={pickerTrigger.handleTriggerClick}
										onKeyDown={(event) => {
											picker.handleReferenceKeyDown(event);
											if (!event.defaultPrevented) {
												pickerTrigger.handleTriggerKeyDown({
													event,
													onActivateWhenOpen: picker.selectActiveOption,
													enableSpaceActivation: true
												});
											}
										}}
										aria-labelledby={labelId}
										aria-describedby={describedBy}
										aria-haspopup="listbox"
										aria-expanded={pickerOpen}
										aria-controls={pickerOpen ? listId : undefined}
										aria-activedescendant={pickerOpen ? picker.getActiveOptionId(listId) : undefined}
									/>
									<PickerPopup
										open={pickerOpen}
										context={picker.context}
										floatingStyles={picker.floatingStyles}
										listId={listId}
										labelId={labelId}
										descriptionId={describedBy}
										activeOptionId={picker.getActiveOptionId(listId)}
										setFloating={picker.setFloating}
										getFloatingProps={picker.getFloatingProps}
										onKeyDown={picker.handleFloatingKeyDown}>
										{options.map((option, index) => (
											<Option
												key={option}
												id={picker.getOptionId(listId, index)}
												ref={(node) => picker.setOptionRef(index, node)}
												role="option"
												active={picker.activeIndex === index}
												selected={pickerValue === option}
												aria-selected={pickerValue === option}
												onMouseDown={(event) => event.preventDefault()}
												onClick={() => picker.selectOption(option)}>
												<div className={styles.pickerOptionContent}>
													<OptionContent text={option} />
												</div>
											</Option>
										))}
									</PickerPopup>
								</>
							);
						}}
					</PickerField>
					<LayoutPicker label="layout-picker · LayoutPicker" value={layout} onChange={setLayout} />
					<MultiSelect
						label="multi-select · MultiSelect"
						options={options}
						value={multiple}
						onChange={setMultiple}
						getOptionKey={(option) => option}
						getOptionLabel={(option) => option}
					/>
					<SliderInput label="slider-input · SliderInput" min={0} max={100} step={5} value={slider} onChange={setSlider} />
				</Section>

				<Section title="Select" description="Одиночный выбор, пресеты, состояние и дерево." className={styles.section}>
					<Select
						label="select · Select"
						options={options}
						value={selected}
						onChange={setSelected}
						getOptionKey={(option) => option}
						getOptionLabel={(option) => option}
						clearable
					/>
					<PeriodSelect label="period-select · PeriodSelect" value={period} onChange={setPeriod} />
					<div className={styles.stack}>
						<h4 className={styles.subheading}>PresetSelect</h4>
						<PresetSelect
							label="preset-select · PresetSelect"
							options={presets}
							value={preset}
							onChange={setPreset}
							clearable
						/>
						<DateRangePresetSelect
							label="date-range-preset-select · DateRangePresetSelect"
							value={rangePreset}
							// referenceDate задаётся явно, чтобы пресеты не зависели от дня открытия Storybook.
							referenceDate={new Date(2026, 9, 4, 12)}
							onChange={setRangePreset}
						/>
					</div>
					<StateSelect
						label="state-select · StateSelect"
						value={state}
						onChange={setState}
						clearable
						stateMeta={{
							none: { label: "Без состояния" },
							information: { label: "Информация" },
							success: { label: "Успех" },
							warning: { label: "Предупреждение" },
							error: { label: "Ошибка" }
						}}
					/>
					<TreeSelect
						label="tree-select · TreeSelect"
						nodes={treeNodes}
						value={treeValue}
						onChange={setTreeValue}
						defaultExpandedCodeKeys={["section"]}
						clearable
					/>
				</Section>

				<Section title="Textarea" description="Многострочное редактирование." className={styles.section}>
					<Textarea label="textarea · Textarea" value={textarea} onChange={setTextarea} placeholder="Введите комментарий" />
				</Section>
			</div>
		);
	}
};
