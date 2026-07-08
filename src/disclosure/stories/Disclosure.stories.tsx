import { Disclosure } from "../Disclosure";
import { DisclosureGroup } from "../DisclosureGroup";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Disclosure",
	component: Disclosure,
	args: {
		label: "Раздел",
		defaultOpen: false,
		children: <p>Содержимое панели раскрытия.</p>
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		label: {
			description: "Заголовок кнопки раскрытия.",
			control: "text"
		},
		defaultOpen: {
			description: "Начальное состояние (открыт/закрыт).",
			control: "boolean"
		},
		children: {
			description: "Контент, который показывается в раскрытой панели.",
			control: false
		}
	}
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Group: Story = {
	render: () => (
		<DisclosureGroup>
			<Disclosure label="Параметры поиска" defaultOpen>
				<div style={{ display: "grid", gap: 8 }}>
					<span>Период: март 2026</span>
					<span>Регион: Урал</span>
				</div>
			</Disclosure>
			<Disclosure label="Сортировка">
				<div style={{ display: "grid", gap: 8 }}>
					<span>Поле: Дата создания</span>
					<span>Порядок: По убыванию</span>
				</div>
			</Disclosure>
			<Disclosure label="Дополнительные фильтры">
				<div style={{ display: "grid", gap: 8 }}>
					<span>Только активные</span>
					<span>Без архивных записей</span>
				</div>
			</Disclosure>
		</DisclosureGroup>
	),
	args: {
		label: "Раздел"
	}
};
