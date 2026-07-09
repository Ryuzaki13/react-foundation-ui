import { useMemo, useState } from "react";

import { CollectionItem } from "@ryuzaki13/react-foundation-lib/odata";

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
		onChange: () => {},
		codeKey: "code",
		textKey: "label",
		items: catalog,
		query: "",
		onQuery: () => {},
		onOpen: () => {},
		onClose: () => {},
		size: "md",
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		value: { control: false },
		onChange: { control: false },
		items: { control: false },
		onQuery: { control: false },
		onOpen: { control: false },
		onClose: { control: false },
		renderToken: { control: false },
		renderToolbar: { control: false },
		renderItem: { control: false },
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		}
	}
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	render: (args) => {
		const [value, setValue] = useState<CollectionItem[]>([catalog[1]]);
		const [query, setQuery] = useState("");
		const filteredItems = useMemo(() => {
			const needle = query.trim().toLowerCase();

			if (!needle) {
				return catalog;
			}

			return catalog.filter((item) => item.label.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle));
		}, [query]);

		return <MultiSelect {...args} value={value} items={filteredItems} query={query} onQuery={setQuery} onChange={setValue} />;
	}
};

export const Loading: Story = {
	render: (args) => {
		const [value, setValue] = useState<CollectionItem[]>([]);

		return <MultiSelect {...args} value={value} items={[]} isLoading onChange={setValue} />;
	}
};

export const ErrorState: Story = {
	render: (args) => {
		const [value, setValue] = useState<CollectionItem[]>([]);

		return <MultiSelect {...args} value={value} items={[]} error="Ошибка загрузки" onChange={setValue} />;
	}
};

export const Empty: Story = {
	render: (args) => {
		const [value, setValue] = useState<CollectionItem[]>([]);

		return <MultiSelect {...args} value={value} items={[]} onChange={setValue} />;
	}
};
