import { Detail } from "../Detail";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Detail",
	component: Detail,
	args: {
		columnCount: 1,
		rowGap: "normal",
		semantic: "list",
		inline: false,
		center: false,
		vertical: "center",
		noWrap: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		columnCount: {
			description: "Количество колонок (1-5).",
			control: "number"
		},
		rowGap: {
			description: "Вертикальные интервалы между строками.",
			control: "inline-radio",
			options: ["none", "small", "normal", "large"]
		},
		semantic: {
			description: "Семантический режим контейнера списка деталей.",
			control: "inline-radio",
			options: ["detail", "list"]
		},
		inline: {
			description: "Размещает метку и значение в одну строку.",
			control: "boolean"
		},
		center: {
			description: "Центрирует текст метки и значения.",
			control: "boolean"
		},
		vertical: {
			description: "Вертикальное выравнивание внутри строки.",
			control: "inline-radio",
			options: ["start", "center", "end"]
		},
		noWrap: {
			description: "Отключает перенос длинного значения.",
			control: "boolean"
		},
		withColon: {
			description: "Добавляет двоеточие после метки.",
			control: "boolean"
		},
		className: {
			description: "Дополнительный CSS-класс списка.",
			control: "text"
		}
	}
} satisfies Meta<typeof Detail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicList: Story = {
	render: (args) => (
		<Detail {...args}>
			<Detail.Item required label="Статус" value="Активен" />
			<Detail.Item label="Приоритет" value="Высокий" />
			<Detail.Item label="Автор" value="Иван Петров" />
		</Detail>
	),
	args: {
		children: undefined
	}
};

export const MultipleColumns: Story = {
	render: (args) => (
		<Detail {...args}>
			<Detail.Item label="ID" value="DOC-12345" />
			<Detail.Item label="Дата" value="05.03.2026" />
			<Detail.Item label="Версия" value="2.7" />
			<Detail.Item label="Подразделение" value="Снабжение" />
			<Detail.Item label="Регион" value="Урал" />
			<Detail.Item label="Комментарий" value="Требуется согласование с бухгалтерией" />
		</Detail>
	),
	args: {
		columnCount: 2,
		rowGap: "small",
		children: undefined
	}
};

export const SemanticDl: Story = {
	render: (args) => (
		<Detail {...args}>
			<Detail.Item label="Клиент" value="ООО Вектор" />
			<Detail.Item label="Менеджер" value="Анна Смирнова" />
			<Detail.Item label="Сумма" value="1 250 000 ₽" />
		</Detail>
	),
	args: {
		semantic: "detail",
		inline: true,
		columnCount: 1,
		children: undefined
	}
};

export const CustomLabel: Story = {
	render: (args) => (
		<Detail {...args}>
			<Detail.Item label={<span>Номер договора</span>} value="KTK-2026-045" />
			<Detail.Item label={<span title="Без двоеточия для составной метки">Статус</span>} value="На согласовании" withColon={false} />
		</Detail>
	),
	args: {
		children: undefined
	}
};
