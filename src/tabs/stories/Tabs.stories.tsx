import { useState, type CSSProperties } from "react";

import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Tabs, TabsBox, TabsLayout, type TabsBoxItem, type TabsBoxProps, type TabsLayoutProps, type TabsProps } from "..";
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

const meta = {
	title: "Shared/UI/Tabs",
	component: TabsBox,
	args: {
		items: demoItems,
		value: "profile",
		onValueChange: fn<(value: string) => void>(),
		orientation: "horizontal",
		activationMode: "automatic",
		mountStrategy: "unmount",
		isLoading: false,
		loadingText: "Загрузка вкладок...",
		cleanPanel: false,
		bordered: false,
		loop: true
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
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
		cleanPanel: {
			description: "Убирает базовые padding и surface-оформление panel-области.",
			control: "boolean"
		},
		bordered: {
			description: "Добавляет рамку вокруг области панелей.",
			control: "boolean"
		},
		loop: {
			description: "Разрешает циклическую навигацию стрелками и Home/End.",
			control: "boolean"
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
			description: "Собственное доступное имя `tablist`, если рядом нет видимого заголовка.",
			control: "text"
		},
		"aria-labelledby": {
			description: "Ссылка на внешний заголовок `tablist` вместо текстовой ARIA-метки.",
			control: "text"
		}
	}
} satisfies Meta<typeof TabsBox>;

export default meta;

type Story = StoryObj<typeof meta>;
type LayoutStory = StoryObj<TabsLayoutProps>;
type LegacyStory = StoryObj<TabsProps>;

function TabsBoxStoryCanvas({ height }: { height?: number } = {}) {
	const [args, updateArgs] = useArgs<TabsBoxProps>();
	const value = args.value ?? args.defaultValue;

	const tabs = (
		<TabsBox
			{...args}
			value={value}
			onValueChange={(nextValue) => {
				args.onValueChange?.(nextValue);
				updateArgs({ value: nextValue });
			}}
		/>
	);

	return height === undefined ? tabs : <div style={{ height }}>{tabs}</div>;
}

function TabsLayoutStoryCanvas() {
	const [args, updateArgs] = useArgs<TabsLayoutProps>();
	const value = args.value ?? args.defaultValue ?? "details";
	const onValueChange = (nextValue: string) => {
		args.onValueChange?.(nextValue);
		updateArgs({ value: nextValue });
	};

	return (
		<div style={{ height: 360 }}>
			<TabsLayout
				value={value}
				defaultValue={args.defaultValue}
				onValueChange={onValueChange}
				orientation={args.orientation}
				activationMode={args.activationMode}
				mountStrategy={args.mountStrategy}
				loop={args.loop}
				cleanPanel={args.cleanPanel}
				bordered={args.bordered}
				className={args.className}
				aria-label={args["aria-label"]}
				aria-labelledby={args["aria-labelledby"]}>
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

function LegacyTabsStoryCanvas() {
	const [args, updateArgs] = useArgs<TabsProps>();
	const value = args.value ?? args.defaultValue;

	return (
		<Tabs
			{...args}
			value={value}
			onValueChange={(nextValue) => {
				args.onValueChange?.(nextValue);
				updateArgs({ value: nextValue });
			}}
		/>
	);
}

export const BoxBasic: Story = {
	args: {
		"aria-label": "Основные разделы профиля"
	},
	render: () => <TabsBoxStoryCanvas />
};

export const BoxControlled: Story = {
	args: {
		value: "settings",
		"aria-label": "Управляемые вкладки"
	},
	render: () => <TabsBoxStoryCanvas />
};

export const BoxVertical: Story = {
	args: {
		orientation: "vertical",
		bordered: true,
		"aria-label": "Вертикальные вкладки"
	},
	render: () => <TabsBoxStoryCanvas height={320} />
};

export const BoxMountStrategies: Story = {
	args: {
		items: lifecycleItems,
		mountStrategy: "lazy",
		"aria-label": "Демонстрация стратегий монтирования"
	},
	render: () => <TabsBoxStoryCanvas />
};

export const DisabledTabs: Story = {
	args: {
		items: disabledItems,
		value: "overview",
		"aria-label": "Вкладки с недоступным разделом"
	},
	render: () => <TabsBoxStoryCanvas />
};

export const LayoutPanels: LayoutStory = {
	args: {
		value: "details",
		onValueChange: fn<(value: string) => void>(),
		orientation: "horizontal",
		activationMode: "manual",
		mountStrategy: "lazy",
		cleanPanel: false,
		bordered: true,
		loop: true,
		"aria-label": "Составные панели документа"
	},
	render: () => <TabsLayoutStoryCanvas />
};

export const LegacyTabs: LegacyStory = {
	args: {
		items: demoItems,
		value: "profile",
		onValueChange: fn<(value: string) => void>(),
		onChange: fn<(value: string) => void>(),
		orientation: "horizontal",
		activationMode: "automatic",
		mountStrategy: "unmount",
		cleanPanel: false,
		bordered: false,
		loop: true,
		"aria-label": "Устаревший совместимый API"
	},
	render: () => <LegacyTabsStoryCanvas />,
	argTypes: {
		onChange: {
			description: "Deprecated callback совместимого компонента `Tabs`.",
			control: false
		}
	},
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
	},
	render: () => <TabsBoxStoryCanvas />
};

export const Empty: Story = {
	args: {
		items: [],
		value: undefined
	},
	render: () => <TabsBoxStoryCanvas />
};
