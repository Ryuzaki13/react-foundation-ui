import { useState, type CSSProperties } from "react";

import { fn } from "storybook/test";

import { TabsBox, TabsLayout, type TabsBoxItem, type TabsBoxProps, type TabsLayoutProps } from "..";
import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
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
	title: "UI/Tabs",
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
		clean: false,
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
		clean: {
			description: "Убирает базовые padding и surface-оформление panel-области.",
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

function createTabsBoxStoryRender(height?: number) {
	return createControlledStoryRender<TabsBoxProps>((args, updateArgs) => {
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
	});
}

const renderTabsLayoutStory = createControlledStoryRender<TabsLayoutProps>((args, updateArgs) => {
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
				clean={args.clean}
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
});

export const BoxBasic: Story = {
	args: {
		"aria-label": "Основные разделы профиля"
	},
	render: createTabsBoxStoryRender()
};

export const BoxControlled: Story = {
	args: {
		value: "settings",
		"aria-label": "Управляемые вкладки"
	},
	render: createTabsBoxStoryRender()
};

export const BoxVertical: Story = {
	args: {
		orientation: "vertical",
		"aria-label": "Вертикальные вкладки"
	},
	render: createTabsBoxStoryRender(320)
};

export const BoxMountStrategies: Story = {
	args: {
		items: lifecycleItems,
		mountStrategy: "lazy",
		"aria-label": "Демонстрация стратегий монтирования"
	},
	render: createTabsBoxStoryRender()
};

export const DisabledTabs: Story = {
	args: {
		items: disabledItems,
		value: "overview",
		"aria-label": "Вкладки с недоступным разделом"
	},
	render: createTabsBoxStoryRender()
};

export const LayoutPanels: LayoutStory = {
	args: {
		value: "details",
		onValueChange: fn<(value: string) => void>(),
		orientation: "horizontal",
		activationMode: "manual",
		mountStrategy: "lazy",
		clean: false,
		loop: true,
		"aria-label": "Составные панели документа"
	},
	render: renderTabsLayoutStory
};

export const Loading: Story = {
	args: {
		isLoading: true,
		items: demoItems
	},
	render: createTabsBoxStoryRender()
};

export const Empty: Story = {
	args: {
		items: [],
		value: undefined
	},
	render: createTabsBoxStoryRender()
};
