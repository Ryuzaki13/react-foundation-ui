import { Button } from "../../button";
import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { Disclosure, type DisclosureProps } from "../Disclosure";
import { DisclosureGroup } from "../DisclosureGroup";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/Disclosure",
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
	argTypes: {
		label: {
			description: "Заголовок кнопки раскрытия.",
			control: "text"
		},
		defaultOpen: {
			description: "Начальное состояние (открыт/закрыт). Изменение аргумента перемонтирует демонстрационный экземпляр.",
			control: "boolean"
		},
		headerActions: {
			description: "Независимые действия в правой части заголовка.",
			control: false
		},
		children: {
			description: "Контент, который показывается в раскрытой панели.",
			control: false
		}
	}
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderDisclosureStory = createControlledStoryRender<DisclosureProps>((args) => {
	// Disclosure поддерживает только initial state, поэтому при изменении defaultOpen
	// через Controls монтируется новый экземпляр с обновлённым начальным значением.
	return <Disclosure key={`disclosure-${String(args.defaultOpen)}`} {...args} />;
});

const renderDisclosureGroupStory = createControlledStoryRender<DisclosureProps>((args) => (
	<DisclosureGroup>
		<Disclosure key={`search-${String(args.defaultOpen)}`} {...args} />
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
));

export const Basic: Story = {
	render: renderDisclosureStory
};

export const HeaderActions: Story = {
	args: {
		headerActions: (
			<Button variant="transparent" onClick={() => undefined}>
				Очистить
			</Button>
		)
	},
	render: renderDisclosureStory
};

export const Group: Story = {
	args: {
		label: "Параметры поиска",
		defaultOpen: true,
		children: (
			<div style={{ display: "grid", gap: 8 }}>
				<span>Период: март 2026</span>
				<span>Регион: Урал</span>
			</div>
		)
	},
	render: renderDisclosureGroupStory
};
