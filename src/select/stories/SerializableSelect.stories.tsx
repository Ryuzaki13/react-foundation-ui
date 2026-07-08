import { useMemo, useState } from "react";

import { SerializableSelect } from "../SerializableSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

type DepartmentOption = {
	id: number;
	name: string;
	code: string;
	branch: string;
};

const departmentOptions: DepartmentOption[] = [
	{ id: 10, name: "Продажи", code: "SLS", branch: "Екатеринбург" },
	{ id: 20, name: "Закупки", code: "PRC", branch: "Челябинск" },
	{ id: 30, name: "Логистика", code: "LGS", branch: "Новосибирск" },
	{ id: 40, name: "Сервис", code: "SRV", branch: "Москва" }
];

const meta = {
	title: "Shared/UI/SerializableSelect",
	component: SerializableSelect<DepartmentOption, "id", "name">,
	args: {
		label: "Подразделение",
		description: "Сериализуемая обёртка над Select для object-options и field-based конфигурации.",
		placeholder: "Выберите подразделение",
		options: departmentOptions,
		optionKey: "id",
		optionLabel: "name",
		value: undefined,
		onChange: () => {},
		size: "md"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		docs: {
			description: {
				component:
					"Высокоуровневая обёртка над low-level Select. Принимает массив объектов, получает key и label по именам полей, а наружу возвращает только значение ключа. Нужна для сериализуемых конфигов, в том числе в src/shared/ui/controls/*."
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
			description: "Текст, когда ключ ещё не выбран.",
			control: "text"
		},
		options: {
			description: "Массив объектных option.",
			control: false
		},
		optionKey: {
			description: "Поле объекта, значение которого используется как ключ и отдаётся наружу через onChange.",
			control: false
		},
		optionLabel: {
			description: "Поле объекта, значение которого отображается как основной текст option.",
			control: false
		},
		renderCode: {
			description: "Если включено, справа от текста будет показан ключ optionKey.",
			control: "boolean"
		},
		value: {
			description: "Текущий выбранный ключ option, а не вся option целиком.",
			control: false
		},
		onChange: {
			description: "Вызывается с новым значением optionKey.",
			control: false
		},
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		disabled: {
			description: "Блокирует взаимодействие с полем.",
			control: "boolean"
		},
		className: {
			description: "Дополнительный CSS-класс корневого контейнера.",
			control: "text"
		}
	}
} satisfies Meta<typeof SerializableSelect<DepartmentOption, "id", "name">>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
	name: "Выбор по ключу",
	render: (args) => {
		const [value, setValue] = useState<number | undefined>(20);

		return <SerializableSelect {...args} value={value} onChange={setValue} />;
	}
};

export const Placeholder: Story = {
	render: (args) => {
		const [value, setValue] = useState<number | undefined>(undefined);

		return <SerializableSelect {...args} value={value} onChange={setValue} />;
	}
};

export const WithCode: Story = {
	name: "С кодом",
	render: (args) => {
		const [value, setValue] = useState<number | undefined>(10);

		return <SerializableSelect {...args} value={value} onChange={setValue} renderCode />;
	},
	args: {
		renderCode: true
	}
};

export const AsyncReloadLike: Story = {
	name: "Смена набора опций",
	render: (args) => {
		const [value, setValue] = useState<number | undefined>(30);
		const [showShortList, setShowShortList] = useState(false);
		const options = useMemo(
			() => (showShortList ? departmentOptions.filter((option) => option.id !== 20) : departmentOptions),
			[showShortList]
		);

		return (
			<div style={{ display: "grid", gap: "12px", maxWidth: "320px" }}>
				<button type="button" onClick={() => setShowShortList((current) => !current)}>
					{showShortList ? "Показать полный список" : "Скрыть одну опцию"}
				</button>
				<SerializableSelect {...args} options={options} value={value} onChange={setValue} />
			</div>
		);
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: 10
	}
};
