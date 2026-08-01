import { useState, type CSSProperties, type ReactNode } from "react";

import { type ReadFileAsDataUrlResult, type ReadFileResult, type ReadImageResult } from "@ryuzaki13/react-foundation-lib/file";
import { type NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";
import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";
import { type State } from "@ryuzaki13/react-foundation-lib/types";

import { Button } from "../../button";
import { CheckBox } from "../../check-box";
import { ContextMenu, DropdownMenu } from "../../context-menu";
import { SingleDateInput } from "../../date-input";
import { DateRangePresetSelect } from "../../date-range-preset-select";
import { SingleDateTimeInput } from "../../date-time-input";
import { Dialog } from "../../dialog";
import { Disclosure, DisclosureGroup } from "../../disclosure";
import { DropZone } from "../../drop-zone";
import { ExpandableActionPanel } from "../../expandable-action-panel";
import { InputNumber, InputText } from "../../input";
import { InputFile } from "../../input-file";
import { InputFiles } from "../../input-files";
import { InputImage } from "../../input-image";
import { InputSearch } from "../../input-search";
import { LayoutPicker } from "../../layout-picker";
import { Listbox } from "../../listbox";
import { Modal, ModalContent, ModalFooter, ModalManagerProvider } from "../../modal";
import { MultiSelect } from "../../multi-select";
import { PeriodSelect } from "../../period-select";
import { Popover } from "../../popover";
import { PresetRangeDateInput } from "../../preset-range-date-input";
import { RadioButton } from "../../radio-button";
import { RadioGroup } from "../../radio-group";
import { Select } from "../../select";
import { Slider, SliderInput } from "../../slider";
import { StateSelect } from "../../state-select";
import { Switch } from "../../switch";
import { TabsBox } from "../../tabs";
import { TagInput } from "../../tag-input";
import { Textarea } from "../../textarea";
import { Toggle } from "../../toggle";
import { TreeMultiSelect, TreeMultiSelectOptionsLayout, TreeMultiSelectValue, TreeSelectNode } from "../../tree-select";
import { demoTreeNodes } from "../../tree-select/stories/treeStoryFixtures";

import type { StoryObj } from "@storybook/react-vite";

const gridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(var(--ui-width-xl), 1fr))",
	alignItems: "start",
	gap: "2em",
	padding: "2em"
} satisfies CSSProperties;

const cardStyle = {
	display: "grid",
	alignContent: "start",
	gridTemplateColumns: "100%",
	gap: "0.5em",
	padding: "1em",
	overflow: "hidden",
	// border: "var(--border)",
	borderRadius: "var(--radius-md)",
	background: "var(--surface-0)",
	boxShadow: "var(--shadow-lg)"
} satisfies CSSProperties;

const cardTitleStyle = {
	fontWeight: 700,
	color: "var(--content-0)"
} satisfies CSSProperties;

const compactButtonStyle = {
	width: "100%"
} satisfies CSSProperties;

const statusOptions = [
	{ id: "draft", label: "Черновик" },
	{ id: "review", label: "На согласовании" },
	{ id: "published", label: "Опубликован" }
];

const cityOptions: CollectionItem[] = [
	{ code: "EKB", label: "Екатеринбург" },
	{ code: "KZN", label: "Казань" },
	{ code: "MOW", label: "Москва" }
];

const listboxOptions = [
	{ value: "day", label: "День" },
	{ value: "week", label: "Неделя" },
	{ value: "month", label: "Месяц" }
];

function ComponentCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section style={cardStyle}>
			<div style={cardTitleStyle}>{title}</div>
			{children}
		</section>
	);
}

function StatefulTreeMultiSelect({
	initialValue = {},
	label = "TreeMultiSelect",
	description,
	optionsLayout = "tree",
	nodes = demoTreeNodes,
	defaultExpandedCodeKeys
}: {
	initialValue?: TreeMultiSelectValue;
	label?: string;
	description?: string;
	optionsLayout?: TreeMultiSelectOptionsLayout;
	nodes?: readonly TreeSelectNode[];
	defaultExpandedCodeKeys?: readonly string[];
}) {
	const [value, setValue] = useState<TreeMultiSelectValue>(initialValue);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
			<TreeMultiSelect
				label={label}
				description={description}
				nodes={nodes}
				value={value}
				onChange={setValue}
				optionsLayout={optionsLayout}
				defaultExpandedCodeKeys={defaultExpandedCodeKeys}
			/>
			<div style={{ fontSize: "var(--font-size-sm)", color: "var(--content-1)" }}>Текущее значение: {JSON.stringify(value)}</div>
		</div>
	);
}

export function InteractiveComponents() {
	const [text, setText] = useState("Значение");
	const [number, setNumber] = useState<number | undefined>(42);
	const [search, setSearch] = useState("");
	const [textarea, setTextarea] = useState("Комментарий");
	const [checked, setChecked] = useState(true);
	const [radio, setRadio] = useState(false);
	const [radioGroup, setRadioGroup] = useState("first");
	const [switchValue, setSwitchValue] = useState(true);
	const [toggleValue, setToggleValue] = useState(false);
	const [sliderValue, setSliderValue] = useState<number | undefined>(60);
	const [sliderInputValue, setSliderInputValue] = useState(60);
	const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number] | undefined>(statusOptions[0]);
	const [selectedCities, setSelectedCities] = useState<CollectionItem[]>([cityOptions[0]!]);
	const [tags, setTags] = useState<readonly string[]>(["UI", "Стили"]);
	const [listboxValue, setListboxValue] = useState("week");
	const [state, setState] = useState<State | undefined>("information");
	const [layout, setLayout] = useState("two-columns");
	const [date, setDate] = useState<Date | null>(new Date(2026, 2, 10));
	const [dateTime, setDateTime] = useState<Date | null>(new Date(2026, 2, 10, 10, 30));
	const [presetId, setPresetId] = useState<string | null>("today");
	const [range, setRange] = useState<NullableDateRange | null>([new Date(2026, 2, 1), new Date(2026, 2, 10)]);
	const [period, setPeriod] = useState<string | undefined>("month");
	const [file, setFile] = useState<ReadFileResult>();
	const [files, setFiles] = useState<ReadFileAsDataUrlResult[]>([]);
	const [image, setImage] = useState<ReadImageResult>();
	const [droppedFiles, setDroppedFiles] = useState<ReadFileResult[]>([]);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div style={gridStyle}>
			<ComponentCard title="Button">
				<Button variant="transparent">Действие</Button>
				<Button variant="ghost">Действие</Button>
				<Button variant="neutral">Действие</Button>
				<Button variant="neutralOutline">Действие</Button>
				<Button variant="info">Действие</Button>
				<Button variant="infoOutline">Действие</Button>
			</ComponentCard>

			<ComponentCard title="InputText">
				<InputText
					label="Текст"
					description="Поле ввода текста"
					placeholder="Введите текст"
					disabled
					value={text}
					onChange={setText}
				/>
				<InputText label="Текст" description="Поле ввода текста" placeholder="Введите текст" value={text} onChange={setText} />
				<InputText
					required
					label="Текст"
					description="Поле ввода текста"
					placeholder="Введите текст"
					value={text}
					onChange={setText}
					onClear={() => setText("")}
				/>
			</ComponentCard>

			<ComponentCard title="InputNumber">
				<InputNumber label="Количество" value={number} min={0} onChange={setNumber} disabled />
				<InputNumber label="Количество" value={number} min={0} onChange={setNumber} required />
				<InputNumber label="Количество" value={number} min={0} onChange={setNumber} />
				<InputNumber label="Количество" value={number} min={0} onChange={setNumber} onClear={() => setNumber(undefined)} />
			</ComponentCard>

			<ComponentCard title="InputSearch">
				<InputSearch label="Поиск" placeholder="Найти" value={search} onChange={setSearch} />
			</ComponentCard>

			<ComponentCard title="Textarea">
				<Textarea
					label="Комментарий"
					required
					placeholder="Многострочный комментарий"
					rows={6}
					value={textarea}
					onChange={setTextarea}
				/>
			</ComponentCard>

			<ComponentCard title="CheckBox">
				<CheckBox label="Опция включена" disabled value={checked} onChange={setChecked} />
				<CheckBox label="Опция включена" value={checked} onChange={setChecked} indeterminate />
			</ComponentCard>

			<ComponentCard title="RadioButton">
				<RadioButton label="Выбранная опция" disabled value={radio} onChange={setRadio} />
				<RadioButton label="Выбранная опция" value={radio} onChange={setRadio} />
			</ComponentCard>

			<ComponentCard title="RadioGroup">
				<RadioGroup value={radioGroup} onChange={setRadioGroup} orientation="vertical" aria-label="Вариант">
					<RadioGroup.Option value="first" label="Первый" />
					<RadioGroup.Option value="second" label="Второй" />
				</RadioGroup>
			</ComponentCard>

			<ComponentCard title="Switch">
				<Switch label="Уведомления" value={switchValue} onChange={setSwitchValue} />
			</ComponentCard>

			<ComponentCard title="Toggle">
				<Toggle label="Режим" value={toggleValue} onChange={setToggleValue} checkedText="Вкл" uncheckedText="Выкл" />
			</ComponentCard>

			<ComponentCard title="Slider">
				<Slider label="Уровень" value={sliderValue} min={0} max={100} onChange={setSliderValue} />
			</ComponentCard>

			<ComponentCard title="SliderInput">
				<SliderInput label="Порог" value={sliderInputValue} min={0} max={100} onChange={setSliderInputValue} />
			</ComponentCard>

			<ComponentCard title="Select">
				<Select
					label="Статус"
					options={statusOptions}
					value={selectedStatus}
					onChange={setSelectedStatus}
					getOptionKey={(option) => option.id}
					getOptionLabel={(option) => option.label}
				/>
				<Select
					label="Статус"
					searchable
					options={statusOptions}
					value={selectedStatus}
					onChange={setSelectedStatus}
					getOptionKey={(option) => option.id}
					getOptionLabel={(option) => option.label}
				/>
			</ComponentCard>

			<ComponentCard title="MultiSelect">
				<MultiSelect
					label="Города"
					items={cityOptions}
					value={selectedCities}
					query=""
					codeKey="code"
					textKey="label"
					onChange={setSelectedCities}
					onQuery={() => undefined}
					onOpen={() => undefined}
					onClose={() => undefined}
				/>
			</ComponentCard>

			<ComponentCard title="TreeMultiSelect">
				<StatefulTreeMultiSelect />
			</ComponentCard>

			<ComponentCard title="TagInput">
				<TagInput label="Теги" placeholder="Добавить" value={tags} onChange={setTags} />
			</ComponentCard>

			<ComponentCard title="Listbox">
				<Listbox options={listboxOptions} value={listboxValue} onChange={(value) => setListboxValue(value)} />
			</ComponentCard>

			<ComponentCard title="StateSelect">
				<StateSelect label="Состояние" value={state} onChange={setState} />
			</ComponentCard>

			<ComponentCard title="LayoutPicker">
				<LayoutPicker label="Раскладка" value={layout} onChange={setLayout} showPlaceholder />
			</ComponentCard>

			<ComponentCard title="SingleDateInput">
				<SingleDateInput label="Дата" value={date} onChange={setDate} selectionMode="week" />
			</ComponentCard>

			<ComponentCard title="SingleDateTimeInput">
				<SingleDateTimeInput label="Дата и время" value={dateTime} onChange={setDateTime} />
			</ComponentCard>

			<ComponentCard title="DateRangePresetSelect">
				<DateRangePresetSelect
					label="Период"
					value={presetId ?? undefined}
					onChange={(nextPresetId) => setPresetId(nextPresetId ?? null)}
					onRangeChange={(payload) => setRange(payload?.range ?? null)}
					referenceDate={new Date(2026, 2, 10, 12)}
				/>
			</ComponentCard>

			<ComponentCard title="PresetRangeDateInput">
				<PresetRangeDateInput
					value={range}
					onChange={setRange}
					presetId={presetId ?? null}
					onPresetIdChange={(nextPresetId) => setPresetId(nextPresetId ?? null)}
					referenceDate={new Date(2026, 2, 10, 12)}
					presetLabel="Быстрый диапазон"
				/>
			</ComponentCard>

			<ComponentCard title="PeriodSelect">
				<PeriodSelect label="Группировка" value={period} onChange={setPeriod} />
			</ComponentCard>

			<ComponentCard title="InputFile">
				<InputFile
					label="Файл"
					placeholder="Выберите файл"
					value={file}
					onChange={setFile}
					onClear={() => setFile(undefined)}
					readMode="data-url"
				/>
			</ComponentCard>

			<ComponentCard title="InputFiles">
				<InputFiles label="Файлы" placeholder="Выберите файлы" value={files} onChange={setFiles} readMode="data-url" />
			</ComponentCard>

			<ComponentCard title="InputImage">
				<InputImage label="Изображение" value={image} onChange={setImage} onClear={() => setImage(undefined)} />
			</ComponentCard>

			<ComponentCard title="DropZone">
				<DropZone value={droppedFiles} multiple readMode="data-url" onChange={(nextFiles) => setDroppedFiles(nextFiles)}>
					<div style={{ display: "grid", placeItems: "center", minHeight: "6em", textAlign: "center" }}>
						{droppedFiles.length ? `Файлов: ${droppedFiles.length}` : "Перетащите файлы"}
					</div>
				</DropZone>
			</ComponentCard>

			<ComponentCard title="TabsBox">
				<TabsBox
					defaultValue="first"
					bordered
					items={[
						{ id: "first", title: "Первый", content: "Содержимое" },
						{ id: "second", title: "Второй", content: "Другая панель" },
						{ id: "third", title: "Ещё одна", content: "Другая панель" },
						{ id: "quat", title: "Четвертая", content: "Другая панель" }
					]}
				/>
			</ComponentCard>

			<ComponentCard title="TabsBox">
				<TabsBox
					defaultValue="first"
					orientation="vertical"
					bordered
					items={[
						{ id: "first", title: "Первый", content: "Содержимое" },
						{ id: "second", title: "Второй", content: "Другая панель" },
						{ id: "third", title: "Ещё одна", content: "Другая панель" },
						{ id: "quat", title: "Четвертая", content: "Другая панель" }
					]}
				/>
			</ComponentCard>

			<ComponentCard title="Disclosure">
				<DisclosureGroup>
					<Disclosure label="Раскрыть 1">Содержимое панели 1</Disclosure>
					<Disclosure label="Раскрыть 2">Содержимое панели 2</Disclosure>
					<Disclosure label="Раскрыть 3">Содержимое панели 3</Disclosure>
					<Disclosure label="Раскрыть 4">Содержимое панели 4</Disclosure>
				</DisclosureGroup>

				<Disclosure label="Раскрыть 1">Содержимое панели 1</Disclosure>
			</ComponentCard>

			<ComponentCard title="ExpandableActionPanel">
				<ExpandableActionPanel>
					<Button variant="transparent">Действие</Button>
				</ExpandableActionPanel>
			</ComponentCard>

			<ComponentCard title="Popover">
				<Popover>
					<Popover.Trigger>
						<Button style={compactButtonStyle}>Открыть</Button>
					</Popover.Trigger>
					<Popover.Content>
						{({ setClose }) => (
							<div style={{ display: "grid", gap: "0.75em", padding: "1em", maxWidth: "14em" }}>
								<div>Содержимое popover</div>
								<Button onClick={setClose}>Закрыть</Button>
							</div>
						)}
					</Popover.Content>
				</Popover>
			</ComponentCard>

			<ComponentCard title="DropdownMenu">
				<DropdownMenu>
					<DropdownMenu.Trigger>
						<Button style={compactButtonStyle}>Действия</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item>Редактировать</DropdownMenu.Item>
						<DropdownMenu.Item>Удалить</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu>
			</ComponentCard>

			<ComponentCard title="ContextMenu">
				<ContextMenu>
					<ContextMenu.Trigger>
						<div
							style={{
								display: "grid",
								placeItems: "center",
								minHeight: "6em",
								padding: "0.75em",
								border: "var(--border)",
								borderRadius: "var(--radius-sm)",
								textAlign: "center"
							}}>
							Правая кнопка мыши
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<ContextMenu.Item>Переименовать</ContextMenu.Item>
						<ContextMenu.Item>Удалить</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu>
			</ComponentCard>

			<ComponentCard title="Dialog">
				<Button style={compactButtonStyle} onClick={() => setDialogOpen(true)}>
					Открыть диалог
				</Button>
				<Dialog title="Подтверждение" description="Подтвердите действие" open={dialogOpen} onClose={() => setDialogOpen(false)}>
					<Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
				</Dialog>
			</ComponentCard>

			<ComponentCard title="Modal">
				<ModalManagerProvider>
					<Button style={compactButtonStyle} onClick={() => setModalOpen(true)}>
						Открыть модалку
					</Button>
					<Modal title="Параметры" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
						<ModalContent>Содержимое модального окна</ModalContent>
						<ModalFooter>
							<Button onClick={() => setModalOpen(false)}>Готово</Button>
						</ModalFooter>
					</Modal>
				</ModalManagerProvider>
			</ComponentCard>
		</div>
	);
}

const meta = {
	title: "Development/Interactive components",
	component: InteractiveComponents,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: "Быстрая витрина интерактивных UI-компонентов для разработки и проверки общих стилей."
			}
		}
	}
} satisfies Meta<typeof InteractiveComponents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
