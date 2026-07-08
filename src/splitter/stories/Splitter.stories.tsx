import { Splitter } from "../Splitter";

import type { Meta, StoryObj } from "@storybook/react-vite";

function StoryCanvas({ children }: { children: React.ReactNode }) {
	return <div style={{ height: 490 }}>{children}</div>;
}

function Panel({ title, description, items = [] }: { title: string; description: string; items?: string[] }) {
	return (
		<div
			style={{
				height: "100%",
				padding: "var(--space-md)",
				borderRadius: "var(--radius-md)",
				border: "var(--border)",
				display: "grid",
				alignContent: "start",
				gap: "var(--space-md)"
			}}
			className="scrollable">
			<div>
				<h2>{title}</h2>
				<p>{description}</p>
			</div>

			{items.length > 0 && (
				<div style={{ display: "grid", gap: "var(--space-sm)" }}>
					{items.map((item) => (
						<div
							key={item}
							style={{
								padding: "var(--space-sm) var(--space-md)",
								borderRadius: "var(--radius-sm)",
								background: "var(--surface-1)"
							}}>
							{item}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function TwoPaneLayout(args: React.ComponentProps<typeof Splitter>) {
	return (
		<StoryCanvas>
			<Splitter {...args}>
				<Panel
					title="Навигация"
					description="Левая панель подходит для фильтров, дерева разделов, списка сущностей или структуры документа."
					items={["Раздел 1", "Раздел 2", "Раздел 3", "Раздел 4"]}
				/>
				<Panel
					title="Рабочая область"
					description="Правая панель обычно содержит детальный контент: таблицу, карточку объекта, форму или вкладки."
					items={["Текущий документ", "История изменений", "Комментарии", "Связанные объекты", "Параметры отображения"]}
				/>
			</Splitter>
		</StoryCanvas>
	);
}

function NestedFourPaneLayout() {
	return (
		<StoryCanvas>
			<Splitter initial={0.48} min={0.25} max={0.75}>
				<Splitter direction="horizontal" initial={0.58} min={0.25} max={0.75}>
					<Panel
						title="Список"
						description="Верхняя левая панель может держать навигацию или результат поиска."
						items={["Поиск", "Фильтр по статусу", "Группы", "Быстрые действия"]}
					/>
					<Panel
						title="Подробности"
						description="Нижняя левая панель подходит для связанного контента по выбранному элементу."
						items={["Свойства", "Ответственный", "Теги", "Контекст"]}
					/>
				</Splitter>

				<Splitter direction="horizontal" initial={0.36} min={0.2} max={0.8}>
					<Panel
						title="Превью"
						description="Верхняя правая панель может содержать документ, схему, карту или live-просмотр."
						items={["Предпросмотр файла", "Масштаб 100%", "Слой подсветки"]}
					/>
					<Panel
						title="Журнал"
						description="Нижняя правая панель часто используется для событий, логов или вспомогательных данных."
						items={["10:31 Импорт завершён", "10:34 Индексация", "10:36 Синхронизация", "10:38 Проверка целостности"]}
					/>
				</Splitter>
			</Splitter>
		</StoryCanvas>
	);
}

function ConstrainedLayout(args: React.ComponentProps<typeof Splitter>) {
	return (
		<StoryCanvas>
			<Splitter {...args}>
				<Panel
					title="Фиксированные ограничения"
					description="У этой панели ужаты границы `min` и `max`, поэтому splitter нельзя увести слишком далеко."
					items={["Нажмите на разделитель", "Используйте стрелки", "Home = минимум", "End = максимум"]}
				/>
				<Panel
					title="Проверка доступности"
					description="Сценарий помогает проверить клавиатурное управление, устойчивость границ и отсутствие рывков при drag."
					items={["ArrowLeft / ArrowRight", "ArrowUp / ArrowDown", "Перетаскивание мышью", "Перетаскивание на тач-устройстве"]}
				/>
			</Splitter>
		</StoryCanvas>
	);
}

const meta = {
	title: "Shared/UI/Splitter",
	component: Splitter,
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	tags: ["autodocs"],
	args: {
		direction: "vertical",
		initial: 0.45,
		min: 0.15,
		max: 0.85
	},
	argTypes: {
		direction: {
			description: "Направление разделения: вертикальное по ширине или горизонтальное по высоте.",
			control: "inline-radio",
			options: ["vertical", "horizontal"]
		},
		initial: {
			description: "Начальная доля первой панели в диапазоне от 0 до 1.",
			control: { type: "range", min: 0, max: 1, step: 0.01 }
		},
		min: {
			description: "Минимальная доля первой панели. Значение автоматически нормализуется в диапазон 0..1.",
			control: { type: "range", min: 0, max: 1, step: 0.01 }
		},
		max: {
			description: "Максимальная доля первой панели. Если `min` и `max` перепутаны местами, компонент сам исправит диапазон.",
			control: { type: "range", min: 0, max: 1, step: 0.01 }
		},
		className: {
			description: "Дополнительный CSS-класс корневого контейнера.",
			control: "text"
		},
		children: {
			description:
				"Splitter ожидает ровно два прямых дочерних элемента. Для большего количества областей используйте вложенные Splitter.",
			control: false
		}
	}
} satisfies Meta<typeof Splitter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
	name: "Две панели",
	render: (args) => <TwoPaneLayout {...args} />
};

export const Horizontal: Story = {
	name: "Горизонтальное разделение",
	render: (args) => <TwoPaneLayout {...args} />,
	args: {
		direction: "horizontal",
		initial: 0.55
	}
};

export const NestedFourPanels: Story = {
	name: "Четыре панели через вложенность",
	render: () => <NestedFourPaneLayout />
};

export const Constrained: Story = {
	name: "Ограничения и клавиатура",
	render: (args) => <ConstrainedLayout {...args} />,
	args: {
		initial: 0.35,
		min: 0.25,
		max: 0.55
	}
};
