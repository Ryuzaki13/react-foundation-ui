import { useState } from "react";

import { Select } from "../Select";

import type { Meta, StoryObj } from "@storybook/react-vite";

type DepartmentOption = {
	id: number;
	name: string;
	code: string;
	manager: string;
	disabled?: boolean;
};

const departmentOptions: DepartmentOption[] = [
	{ id: 1, name: "Отдел продаж", code: "SLS", manager: "Елена Миронова" },
	{ id: 2, name: "Закупки", code: "PRC", manager: "Антон Мелихов" },
	{ id: 3, name: "Логистика", code: "LGS", manager: "Мария Климова", disabled: true },
	{ id: 4, name: "Поддержка клиентов", code: "SUP", manager: "Ирина Белова" }
];

const primitiveOptions = ["Новый", "В работе", "Завершён", "Архив"] as const;

const meta = {
	title: "Shared/UI/Select",
	component: Select<DepartmentOption>,
	args: {
		label: "Подразделение",
		description: "Выберите подразделение из списка.",
		placeholder: "Не выбрано",
		value: undefined,
		options: departmentOptions,
		onChange: () => {},
		getOptionKey: (option: DepartmentOption) => option.id,
		getOptionLabel: (option: DepartmentOption) => option.name,
		getOptionCode: (option: DepartmentOption) => option.code,
		getOptionDisabled: (option: DepartmentOption) => option.disabled ?? false,
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		docs: {
			description: {
				component:
					"Низкоуровневый getter-based select. Подходит для произвольных структур данных, примитивов и сложного кастомного рендера. Компонент возвращает наружу саму выбранную option. Для сериализуемых конфигов и сценариев с optionKey/optionLabel используйте SerializableSelect."
			}
		}
	},
	tags: ["autodocs"],
	argTypes: {
		label: {
			description: "Заголовок поля.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Текст, когда значение ещё не выбрано.",
			control: "text"
		},
		value: {
			description: "Текущая выбранная option целиком.",
			control: false
		},
		options: {
			description: "Массив опций любого поддерживаемого формата.",
			control: false
		},
		onChange: {
			description: "Вызывается с выбранной option.",
			control: false
		},
		getOptionKey: {
			description: "Функция получения уникального ключа option.",
			control: false
		},
		getOptionLabel: {
			description: "Функция получения основного текста option.",
			control: false
		},
		getOptionCode: {
			description: "Опциональный рендер дополнительного кода справа.",
			control: false
		},
		getOptionDisabled: {
			description: "Опциональная функция блокировки отдельных option.",
			control: false
		},
		getOptionAriaLabel: {
			description: "Опциональная функция для aria-label option.",
			control: false
		},
		getOptionClassName: {
			description: "Опциональная функция CSS-класса option по её состоянию.",
			control: false
		},
		renderOption: {
			description: "Полностью кастомный рендер option в списке.",
			control: false
		},
		renderValue: {
			description: "Кастомный рендер выбранного значения в кнопке.",
			control: false
		},
		className: {
			description: "Дополнительный CSS-класс корневого контейнера.",
			control: "text"
		},
		buttonClassName: {
			description: "Дополнительный CSS-класс кнопки выбора.",
			control: "text"
		},
		optionsClassName: {
			description: "Дополнительный CSS-класс контейнера списка.",
			control: "text"
		},
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		placement: {
			description: "Позиционирование выпадающего списка.",
			control: "select",
			options: ["bottom-start", "bottom-end", "top-start", "top-end"]
		},
		disabled: {
			description: "Блокирует взаимодействие с полем.",
			control: "boolean"
		}
	}
} satisfies Meta<typeof Select<DepartmentOption>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ControlledObjects: Story = {
	name: "Объекты",
	render: (args) => {
		const [value, setValue] = useState<DepartmentOption | undefined>(departmentOptions[1]);

		return <Select {...args} value={value} onChange={setValue} />;
	}
};

export const PrimitiveOptions: Story = {
	name: "Примитивы",
	render: () => {
		const [value, setValue] = useState<(typeof primitiveOptions)[number] | undefined>(primitiveOptions[1]);

		return (
			<Select
				label="Статус"
				description="Пример использования низкоуровневого Select со строковыми значениями."
				placeholder="Выберите статус"
				options={primitiveOptions}
				value={value}
				onChange={setValue}
				getOptionKey={(option) => option}
				getOptionLabel={(option) => option}
				size="md"
			/>
		);
	}
};

export const Placeholder: Story = {
	render: (args) => {
		const [value, setValue] = useState<DepartmentOption | undefined>(undefined);

		return <Select {...args} value={value} onChange={setValue} />;
	}
};

export const CustomOptionLayout: Story = {
	name: "Кастомный рендер",
	render: (args) => {
		const [value, setValue] = useState<DepartmentOption | undefined>(departmentOptions[0]);

		return (
			<Select
				{...args}
				value={value}
				onChange={setValue}
				renderValue={(option) => `${option.code} · ${option.name}`}
				renderOption={(option, state) => (
					<>
						<div className="flexEllipsis">
							<div>{option.name}</div>
							<div className="fontSizeSm content2">{option.manager}</div>
						</div>
						<div style={{ opacity: state.selected ? 1 : 0.5 }}>{option.code}</div>
					</>
				)}
			/>
		);
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: departmentOptions[0]
	}
};
