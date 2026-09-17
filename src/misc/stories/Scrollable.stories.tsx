import { type ComponentProps } from "react";

import { Scrollable } from "..";

import type { Meta, StoryObj } from "@storybook/react-vite";

const events = Array.from({ length: 12 }, (_, index) => `Событие ${index + 1}`);

const meta = {
	title: "UI/Scrollable",
	component: Scrollable,
	args: {
		height: 160,
		stable: true,
		overscroll: true,
		role: "region",
		"aria-label": "Журнал событий",
		tabIndex: 0
	},
	argTypes: {
		height: {
			description: "Высота области прокрутки.",
			control: "text"
		},
		stable: {
			description: "Резервирует место для полосы прокрутки.",
			control: "boolean"
		},
		overscroll: {
			description: "Удерживает прокрутку внутри компонента на границах.",
			control: "boolean"
		},
		role: {
			description: "ARIA-роль значимой области прокрутки; по умолчанию не задаётся.",
			control: "text"
		},
		"aria-label": {
			description: "Доступное имя области, если она объявлена отдельным region.",
			control: "text"
		},
		tabIndex: {
			description: "Добавляет область в порядок фокуса для управления прокруткой с клавиатуры.",
			control: "number"
		}
	},
	render: function Render(args: ComponentProps<typeof Scrollable>) {
		return (
			<Scrollable {...args} className="border radiusSm paddingSm">
				<ol>
					{events.map((event) => (
						<li key={event}>{event}</li>
					))}
				</ol>
			</Scrollable>
		);
	}
} satisfies Meta<typeof Scrollable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AccessibleRegion: Story = {};
