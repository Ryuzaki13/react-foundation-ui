import { useState, type CSSProperties } from "react";

import { Tabs, TabsBox, TabsLayout, type TabsBoxItem } from "..";
import { Scrollable } from "../../misc";

import type { Meta, StoryObj } from "@storybook/react-vite";

const panelStyle = { padding: 16, display: "grid", gap: 12 } satisfies CSSProperties;

const demoItems: TabsBoxItem[] = [
	{
		id: "profile",
		title: "Профиль",
		content: <div style={panelStyle}>Карточка пользователя и основные поля профиля.</div>
	},
	{
		id: "settings",
		title: "Настройки",
		content: <div style={panelStyle}>Параметры интерфейса, уведомлений и доступа.</div>
	},
	{
		id: "history",
		title: "История",
		content: <div style={panelStyle}>Последние действия, комментарии и изменения.</div>
	}
];

function StatefulPanel({ label }: { label: string }) {
	const [counter, setCounter] = useState(0);

	return (
		<div style={panelStyle}>
			<div>Панель: {label}</div>
			<div>Локальный счётчик: {counter}</div>
			<button type="button" onClick={() => setCounter((prev) => prev + 1)}>
				Увеличить
			</button>
		</div>
	);
}

const lifecycleItems: TabsBoxItem[] = [
	{
		id: "first",
		title: "Первая",
		content: <StatefulPanel label="Первая" />
	},
	{
		id: "second",
		title: "Вторая",
		content: <StatefulPanel label="Вторая" />
	},
	{
		id: "third",
		title: "Третья",
		content: <StatefulPanel label="Третья" />
	}
];

const disabledItems: TabsBoxItem[] = [
	{
		id: "overview",
		title: "Обзор",
		content: <div style={panelStyle}>Раздел доступен сразу.</div>
	},
	{
		id: "analytics",
		title: "Аналитика",
		disabled: true,
		content: <div style={panelStyle}>Пока недоступно.</div>
	},
	{
		id: "history",
		title: "История",
		content: <div style={panelStyle}>История изменений и действий.</div>
	}
];

const longLines = Array.from({ length: 12 }, (_, index) => `Элемент ${index + 1}`);

function LayoutStory() {
	const [value, setValue] = useState("details");

	return (
		<div style={{ height: 360 }}>
			<TabsLayout value={value} onValueChange={setValue} bordered aria-label="Составные панели документа">
				<TabsLayout.Tab id="details" title="Детали">
					<TabsLayout.Toolbar>
						<div className="surface0 border radiusSm paddingSm">Панель инструментов вне scroll-области.</div>
					</TabsLayout.Toolbar>
					<TabsLayout.Content>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: "100%" }}>
							<Scrollable className="surface0 border radiusSm paddingSm h100">
								{longLines.map((line) => (
									<div key={`left-${line}`} className="paddingBlockXs">
										Левая колонка: {line}
									</div>
								))}
							</Scrollable>
							<Scrollable className="surface0 border radiusSm paddingSm h100">
								{longLines.map((line) => (
									<div key={`right-${line}`} className="paddingBlockXs">
										Правая колонка: {line}
									</div>
								))}
							</Scrollable>
						</div>
					</TabsLayout.Content>
					<TabsLayout.Footer>
						<div className="surface0 border radiusSm paddingSm">Футер тоже исключён из scroll-контента.</div>
					</TabsLayout.Footer>
				</TabsLayout.Tab>

				<TabsLayout.Tab id="history" title="История">
					<TabsLayout.Content>
						<Scrollable className="surface0 border radiusSm paddingSm h100">
							{longLines.map((line) => (
								<div key={`history-${line}`} className="paddingBlockXs">
									История изменения: {line}
								</div>
							))}
						</Scrollable>
					</TabsLayout.Content>
				</TabsLayout.Tab>
			</TabsLayout>
		</div>
	);
}

const meta = {
	title: "Shared/UI/Tabs",
	component: TabsBox,
	args: {
		items: demoItems,
		orientation: "horizontal",
		activationMode: "automatic",
		mountStrategy: "unmount",
		isLoading: false,
		loadingText: "Загрузка вкладок...",
		bordered: false,
		loop: true
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	argTypes: {
		items: {
			description: "Набор вкладок для `TabsBox`. Каждая вкладка задаётся через `id`, `title`, `content` и опциональный `disabled`.",
			control: false
		},
		value: {
			description: "Активная вкладка в controlled-режиме.",
			control: "text"
		},
		defaultValue: {
			description: "Начальная вкладка в uncontrolled-режиме.",
			control: "text"
		},
		onValueChange: {
			description: "Вызывается при смене активной вкладки.",
			control: false
		},
		orientation: {
			description: "Направление списка вкладок.",
			control: "inline-radio",
			options: ["horizontal", "vertical"]
		},
		activationMode: {
			description: "Режим клавиатурной активации: `automatic` меняет вкладку стрелками, `manual` только переводит фокус.",
			control: "inline-radio",
			options: ["automatic", "manual"]
		},
		mountStrategy: {
			description: "Политика монтирования панелей: `unmount`, `lazy` или `keep-mounted`.",
			control: "inline-radio",
			options: ["unmount", "lazy", "keep-mounted"]
		},
		bordered: {
			description: "Добавляет рамку вокруг области панелей.",
			control: "boolean"
		},
		loop: {
			description: "Разрешает циклическую навигацию стрелками и Home/End.",
			control: "boolean"
		},
		className: {
			description: "Дополнительный CSS-класс корневого контейнера.",
			control: "text"
		},
		isLoading: {
			description: "Показывает loading-состояние `TabsBox`.",
			control: "boolean"
		},
		loadingText: {
			description: "Текст внутри loading-состояния.",
			control: "text"
		},
		"aria-label": {
			description: "Текстовая подпись для `tablist`, если рядом нет видимого заголовка.",
			control: "text"
		},
		"aria-labelledby": {
			description: "Ссылка на внешний заголовок `tablist`.",
			control: "text"
		}
	}
} satisfies Meta<typeof TabsBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BoxBasic: Story = {
	args: {
		"aria-label": "Основные разделы профиля"
	}
};

export const BoxControlled: Story = {
	render: (args) => {
		const [value, setValue] = useState("settings");

		return <TabsBox {...args} value={value} onValueChange={setValue} />;
	},
	args: {
		value: "settings",
		"aria-label": "Управляемые вкладки"
	}
};

export const BoxVertical: Story = {
	render: (args) => (
		<div style={{ height: 320 }}>
			<TabsBox {...args} />
		</div>
	),
	args: {
		orientation: "vertical",
		bordered: true,
		"aria-label": "Вертикальные вкладки"
	}
};

export const BoxMountStrategies: Story = {
	render: (args) => <TabsBox {...args} items={lifecycleItems} />,
	args: {
		mountStrategy: "lazy",
		"aria-label": "Демонстрация стратегий монтирования"
	}
};

export const DisabledTabs: Story = {
	args: {
		items: disabledItems,
		"aria-label": "Вкладки с недоступным разделом"
	}
};

export const LayoutPanels: Story = {
	render: () => <LayoutStory />
};

export const LegacyTabs: Story = {
	render: (args) => <Tabs {...args} items={demoItems} aria-label="Устаревший совместимый API" />,
	parameters: {
		docs: {
			description: {
				story: "Совместимый фасад поверх `TabsBox`. Новый функционал добавляется только в `TabsBox` и `TabsLayout`."
			}
		}
	}
};

export const Loading: Story = {
	args: {
		isLoading: true,
		items: demoItems
	}
};

export const Empty: Story = {
	args: {
		items: []
	}
};
