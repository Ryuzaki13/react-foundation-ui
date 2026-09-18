import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { MultiSelect, type MultiSelectProps } from "../MultiSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

type DepartmentOption = {
	id: string;
	name: string;
	code: string;
	direction: string;
	searchAliases: readonly string[];
};

const departmentOptions: DepartmentOption[] = [
	{
		id: "all-departments",
		name: "Все подразделения",
		code: "*",
		direction: "Общий выбор",
		searchAliases: ["вся организация"]
	},
	{
		id: "education:north",
		name: "Учебное отделение «Север»",
		code: "УО-01",
		direction: "Учебные подразделения",
		searchAliases: ["СПО", "северный корпус"]
	},
	{
		id: "education:south",
		name: "Учебное отделение «Юг»",
		code: "УО-01",
		direction: "Учебные подразделения",
		searchAliases: ["СПО", "южный корпус"]
	},
	{
		id: "support:methodology",
		name: "Методический отдел",
		code: "МЕТОД",
		direction: "Подразделения сопровождения",
		searchAliases: ["методисты", "образовательные программы"]
	},
	{
		id: "support:it",
		name: "Отдел цифровых сервисов",
		code: "ИТ",
		direction: "Подразделения сопровождения",
		searchAliases: ["техническая поддержка", "информационные технологии"]
	}
];

const meta = {
	title: "UI/MultiSelect",
	component: MultiSelect<DepartmentOption>,
	args: {
		label: "Подразделения",
		description: "Выберите одно или несколько подразделений.",
		placeholder: "Начните вводить",
		options: departmentOptions,
		value: [],
		onChange: fn<(value: DepartmentOption[]) => void>(),
		getOptionKey: (option: DepartmentOption) => option.id,
		getOptionLabel: (option: DepartmentOption) => option.name,
		getOptionCode: (option: DepartmentOption) => option.code,
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		docs: {
			description: {
				component:
					"Типобезопасный getter-based мультиселект для произвольных option. Identity, текст, отображаемый код, группа и поисковое представление задаются независимо."
			}
		}
	},
	argTypes: {
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		placeholder: { description: "Текст пустого поля.", control: "text" },
		options: { description: "Исходные типизированные option без промежуточного CollectionItem.", control: false },
		value: { description: "Контролируемый набор выбранных option целиком.", control: false },
		onChange: { description: "Подтверждает выбор массивом исходных option.", control: false },
		getOptionKey: { description: "Возвращает устойчивый уникальный identity option.", control: false },
		getOptionLabel: { description: "Возвращает основной отображаемый текст option.", control: false },
		getOptionCode: { description: "Возвращает дополнительный отображаемый код, независимый от identity.", control: false },
		getOptionGroup: { description: "Объединяет соседние option под доступным заголовком группы.", control: false },
		getOptionSearchText: {
			description: "Задаёт поисковое представление option; может вернуть строку или набор строк.",
			control: false
		},
		getOptionDisabled: {
			description: "Блокирует option с учётом draft-выбора и подтверждённого значения.",
			control: false
		},
		query: { description: "Контролируемый поисковый запрос.", control: "text" },
		defaultQuery: { description: "Начальный запрос в uncontrolled-режиме.", control: "text" },
		highlightQuery: { description: "Отдельный запрос для подсветки совпадений.", control: "text" },
		onQuery: { description: "Вызывается при изменении поискового запроса.", control: false },
		defaultFilter: { description: "Включает встроенную фильтрацию option.", control: "boolean" },
		onOpen: { description: "Вызывается при открытии списка.", control: false },
		onClose: { description: "Вызывается после закрытия и подтверждения draft-выбора.", control: false },
		error: { description: "Текст ошибки получения option.", control: "text" },
		isLoading: { description: "Показывает состояние загрузки.", control: "boolean" },
		renderToken: { description: "Кастомный рендер значения в trigger.", control: false },
		renderToolbar: { description: "Кастомный рендер панели действий popup.", control: false },
		renderOption: { description: "Возвращает структурированные text и code для строки option.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof MultiSelect<DepartmentOption>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IndependentIdentity: Story = {
	name: "Identity независимо от code",
	render: function Render(args) {
		const [, updateArgs] = useArgs<MultiSelectProps<DepartmentOption>>();

		return (
			<MultiSelect
				{...args}
				value={args.value ?? [departmentOptions[1]]}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
	args: {
		description: "Обе учебные option имеют code УО-01, но остаются независимыми благодаря разным id.",
		value: [departmentOptions[1]]
	}
};

export const GroupedSelectedFirst: Story = {
	name: "Группы и выбранные option первыми",
	render: function Render(args) {
		const [, updateArgs] = useArgs<MultiSelectProps<DepartmentOption>>();

		return (
			<MultiSelect
				{...args}
				getOptionGroup={(option) => ({ key: option.direction, label: option.direction })}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
	args: {
		description: "Подтверждённые option показаны первыми; внутри выбранной и доступной секций группы строятся независимо.",
		value: [departmentOptions[1], departmentOptions[3]]
	}
};

export const ContextualDisabledAndSearch: Story = {
	name: "Контекстная блокировка и поиск",
	render: function Render(args) {
		const [, updateArgs] = useArgs<MultiSelectProps<DepartmentOption>>();
		const query = args.query ?? "";

		return (
			<MultiSelect
				{...args}
				query={query}
				onQuery={(nextQuery) => {
					args.onQuery?.(nextQuery);
					updateArgs({ query: nextQuery });
				}}
				getOptionSearchText={(option) => [option.name, option.code, ...option.searchAliases]}
				getOptionDisabled={(option, context) => {
					const allDepartmentsKey = departmentOptions[0].id;
					const hasAllDepartments = context.selectedKeys.has(allDepartmentsKey);

					if (option.id === allDepartmentsKey) {
						return [...context.selectedKeys].some((key) => key !== allDepartmentsKey);
					}

					return hasAllDepartments;
				}}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
	args: {
		description: "«Все подразделения» взаимоисключается с частным выбором. Поиск учитывает скрытые синонимы, например «СПО».",
		query: "",
		onQuery: fn<(value: string) => void>(),
		value: []
	}
};
