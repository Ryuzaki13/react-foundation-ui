import { useMemo } from "react";

import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { MultiSelect } from "../MultiSelect";

import type { Meta, StoryObj } from "@storybook/react-vite";

const catalog: CollectionItem[] = [
	{ code: "MOW", label: "Москва" },
	{ code: "SPB", label: "Санкт-Петербург" },
	{ code: "EKB", label: "Екатеринбург" },
	{ code: "KZN", label: "Казань" },
	{ code: "NSK", label: "Новосибирск" }
];

const meta = {
	title: "Shared/UI/MultiSelect",
	component: MultiSelect,
	args: {
		label: "Города",
		description: "Выберите несколько значений.",
		placeholder: "Начните вводить",
		value: [],
		onChange: fn<(value: CollectionItem[]) => void>(),
		codeKey: "code",
		textKey: "label",
		items: catalog,
		query: "",
		onQuery: fn<(value: string) => void>(),
		onOpen: () => {},
		onClose: fn<(value: CollectionItem[]) => void>(),
		size: "md",
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: { description: "Заголовок поля.", control: "text" },
		description: { description: "Описание под полем.", control: "text" },
		placeholder: { description: "Текст пустого поля.", control: "text" },
		value: { description: "Контролируемый набор выбранных option.", control: false },
		onChange: { description: "Вызывается после подтверждения набора option.", control: false },
		codeKey: { description: "Имя поля option с уникальным ключом.", control: "text" },
		textKey: { description: "Имя поля option с отображаемым текстом.", control: "text" },
		hideCode: { description: "Скрывает код option в токенах и списке.", control: "boolean" },
		items: { description: "Набор доступных option.", control: false },
		query: { description: "Контролируемый текст поиска.", control: "text" },
		defaultQuery: { description: "Начальный текст поиска в uncontrolled-режиме.", control: "text" },
		highlightQuery: { description: "Текст, который подсвечивается в option.", control: "text" },
		onQuery: { description: "Вызывается при вводе поисковой строки.", control: false },
		defaultFilter: { description: "Включает встроенную фильтрацию option.", control: "boolean" },
		getOptionDisabled: { description: "Блокирует отдельные option с учетом текущего выбора.", control: false },
		onOpen: { description: "Вызывается при открытии списка.", control: false },
		onClose: { description: "Вызывается при закрытии списка после commit.", control: false },
		error: { description: "Текст ошибки загрузки option.", control: "text" },
		isLoading: { description: "Показывает состояние загрузки option.", control: "boolean" },
		renderToken: { description: "Кастомный рендер выбранных токенов.", control: false },
		renderToolbar: { description: "Кастомный рендер toolbar popup.", control: false },
		renderItem: { description: "Возвращает text, code и searchText для общей композиции OptionButton.", control: false },
		disabled: { description: "Блокирует взаимодействие с полем.", control: "boolean" },
		size: {
			description: "Размер поля и подписей.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<React.ComponentProps<typeof MultiSelect>>();
		const value = args.value ?? [catalog[1]!];
		const query = args.query ?? "";
		const filteredItems = useMemo(() => {
			const needle = query.trim().toLowerCase();

			if (!needle) {
				return catalog;
			}

			return catalog.filter((item) => item.label.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle));
		}, [query]);

		return (
			<MultiSelect
				{...args}
				value={value}
				items={filteredItems}
				query={query}
				onQuery={(query) => {
					args.onQuery?.(query);
					updateArgs({ query });
				}}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	}
};

export const Loading: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<React.ComponentProps<typeof MultiSelect>>();

		return (
			<MultiSelect
				{...args}
				value={args.value ?? []}
				items={[]}
				isLoading
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	}
};

export const ErrorState: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<React.ComponentProps<typeof MultiSelect>>();

		return (
			<MultiSelect
				{...args}
				value={args.value ?? []}
				items={[]}
				error="Ошибка загрузки"
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	}
};

export const Empty: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<React.ComponentProps<typeof MultiSelect>>();

		return (
			<MultiSelect
				{...args}
				value={args.value ?? []}
				items={[]}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	}
};
