import { type Meta, type StoryObj } from "@storybook/react-vite";

import { FloatingWindows } from "../index";

import { IndependentFloatingWindowsExample } from "./IndependentFloatingWindowsExample";
import { InteractiveFloatingWindowsExample } from "./InteractiveFloatingWindowsExample";
import { NarrowFloatingWindowsExample } from "./NarrowFloatingWindowsExample";
import { PersistentFloatingWindowsExample } from "./PersistentFloatingWindowsExample";

const meta = {
	title: "Layout/FloatingWindows",
	component: FloatingWindows,
	args: { children: null },
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Немодальные перемещаемые окна внутри явно заданной области. Состав окон и их содержимое принадлежат приложению; контейнер управляет координатами и порядком наложения. Полный контракт находится в src/floating-windows/README.md."
			}
		}
	}
} satisfies Meta<typeof FloatingWindows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveWindows: Story = {
	name: "Два интерактивных окна",
	render: InteractiveFloatingWindowsExample
};

export const NarrowHost: Story = {
	name: "Узкая область и длинное содержимое",
	render: NarrowFloatingWindowsExample
};

export const IndependentHosts: Story = {
	name: "Независимые области",
	render: IndependentFloatingWindowsExample
};

export const PersistedPositions: Story = {
	name: "Сохранение координат",
	render: PersistentFloatingWindowsExample
};
