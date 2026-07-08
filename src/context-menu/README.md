# Context Menu

Универсальный модуль меню с двумя сценариями открытия:

- `DropdownMenu` — открытие по обычному клику.
- `ContextMenu` — открытие строго по событию `contextmenu` (правый клик), также поддержан клавиатурный вызов `Shift+F10` и клавиша `ContextMenu`.

Реализация разделена на:

- функциональный слой в `src/shared/lib/context-menu`;
- UI-слой в `src/shared/ui/basic/context-menu`.

Модуль готов к production-использованию: поддерживает controlled/uncontrolled режим, позиционирование через `floating-ui`, анимацию через `motion`, базовую a11y-разметку и клавиатурную навигацию.

---

## Быстрый старт

```tsx
import { ContextMenu, DropdownMenu } from "@/shared/ui";
```

### Обычное меню (по клику)

```tsx
<DropdownMenu>
	<DropdownMenu.Trigger>
		<button type="button">Действия</button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Item>Редактировать</DropdownMenu.Item>
		<DropdownMenu.Item>Копировать</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Удалить</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu>
```

### Контекстное меню (по правому клику)

```tsx
<ContextMenu>
	<ContextMenu.Trigger>
		<div style={{ width: 320, height: 180 }}>Нажмите правой кнопкой мыши</div>
	</ContextMenu.Trigger>

	<ContextMenu.Content>
		<ContextMenu.Item>Переименовать</ContextMenu.Item>
		<ContextMenu.Item>Дублировать</ContextMenu.Item>
		<ContextMenu.Separator />
		<ContextMenu.Item>Переместить в корзину</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu>
```

### Радиальное контекстное меню

Радиальное меню подходит для короткого набора частых действий, которые удобно выбирать вокруг точки вызова. Для длинных списков, групп, разделителей и вложенных сценариев используйте обычный `ContextMenu.Content`.

```tsx
<ContextMenu>
	<ContextMenu.Trigger>
		<div style={{ width: 320, height: 180 }}>Нажмите правой кнопкой мыши</div>
	</ContextMenu.Trigger>

	<ContextMenu.RadialContent>
		<ContextMenu.RadialItem icon={<PencilLine />}>Править</ContextMenu.RadialItem>
		<ContextMenu.RadialItem icon={<Copy />}>Копия</ContextMenu.RadialItem>
		<ContextMenu.RadialItem icon={<Pin />}>Закрепить</ContextMenu.RadialItem>
		<ContextMenu.RadialItem icon={<Eye />}>Просмотр</ContextMenu.RadialItem>
	</ContextMenu.RadialContent>
</ContextMenu>
```

В v1 радиальное меню поддерживает выбор только кликом по пункту. Выбор жестом по направлению движения и отпусканию кнопки мыши не реализован.

---

## API: UI-слой

## `DropdownMenu`

Root-компонент для меню, открываемого по клику.

### Props

| Prop           | Тип                                | По умолчанию     | Описание                                                                           |
| -------------- | ---------------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                  | —                | Композиция из `Trigger`, `Content` и опционально `Item`, `Separator`, `GroupLabel` |
| `placement`    | `Placement` (`@floating-ui/react`) | `"bottom-start"` | Позиция меню относительно trigger-элемента                                         |
| `open`         | `boolean`                          | —                | Controlled-состояние открытия                                                      |
| `defaultOpen`  | `boolean`                          | `false`          | Начальное состояние в uncontrolled-режиме                                          |
| `onOpenChange` | `(open: boolean) => void`          | —                | Колбэк изменения состояния                                                         |

---

## `ContextMenu`

Root-компонент для меню, открываемого по `contextmenu`.

### Props

| Prop           | Тип                                | По умолчанию    | Описание                                                                           |
| -------------- | ---------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                  | —               | Композиция из `Trigger`, `Content` и опционально `Item`, `Separator`, `GroupLabel` |
| `placement`    | `Placement` (`@floating-ui/react`) | `"right-start"` | Позиция меню относительно точки правого клика                                      |
| `open`         | `boolean`                          | —               | Controlled-состояние открытия                                                      |
| `defaultOpen`  | `boolean`                          | `false`         | Начальное состояние в uncontrolled-режиме                                          |
| `onOpenChange` | `(open: boolean) => void`          | —               | Колбэк изменения состояния                                                         |

---

## `ContextMenu.RadialContent`

Кольцевой контейнер для коротких контекстных команд вокруг точки открытия.

### Props

| Prop                  | Тип                                                                        | По умолчанию | Описание                                      |
| --------------------- | -------------------------------------------------------------------------- | ------------ | --------------------------------------------- |
| `children`            | `React.ReactNode \| ((ctx: { closeMenu: () => void }) => React.ReactNode)` | —            | Набор `ContextMenu.RadialItem`                |
| `className`           | `string`                                                                   | —            | Дополнительный CSS-класс контейнера           |
| `closeOnOutside`      | `boolean`                                                                  | `true`       | Закрывать ли меню при клике вне него          |
| `closeOnEscape`       | `boolean`                                                                  | `true`       | Закрывать ли меню по клавише `Escape`         |
| `disableOutsideClick` | `boolean`                                                                  | `false`      | Полностью выключить закрытие по клику снаружи |
| `restoreFocus`        | `boolean`                                                                  | `true`       | Возвращать ли фокус в trigger после закрытия  |
| `radius`              | `number`                                                                   | `76`         | Радиус раскладки пунктов в пикселях           |
| `itemSize`            | `number`                                                                   | `64`         | Размер одного пункта в пикселях               |
| `closeLabel`          | `string`                                                                   | `"Закрыть"`  | Текст и `aria-label` центральной кнопки       |

### Поведение

- Рендер в `document.body` через портал.
- Центрируется на точке правого клика или на центре trigger-элемента при `Shift+F10`.
- Центральная кнопка закрывает меню и не участвует в раскладке `RadialItem`.
- Не выходит за границы viewport.
- Навигация с клавиатуры: `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, `End`, `Escape`.
- Оптимальный диапазон — 4-8 пунктов.

---

## `ContextMenu.RadialItem`

Пункт радиального меню.

### Props

| Prop            | Тип                                                    | По умолчанию | Описание                    |
| --------------- | ------------------------------------------------------ | ------------ | --------------------------- |
| `children`      | `React.ReactNode`                                      | —            | Подпись пункта              |
| `icon`          | `React.ReactNode`                                      | —            | Иконка над подписью         |
| `className`     | `string`                                               | —            | Дополнительный CSS-класс    |
| `disabled`      | `boolean`                                              | `false`      | Блокирует выбор пункта      |
| `closeOnSelect` | `boolean`                                              | `true`       | Закрывать меню после выбора |
| `onSelect`      | `(event: React.MouseEvent<HTMLButtonElement>) => void` | —            | Обработчик выбора           |

---

## `*.Trigger`

Компоненты-триггеры:

- `DropdownMenu.Trigger`
- `ContextMenu.Trigger`

### Props

| Prop       | Тип                  | По умолчанию | Описание                                                            |
| ---------- | -------------------- | ------------ | ------------------------------------------------------------------- |
| `children` | `React.ReactElement` | —            | Единственный дочерний элемент, в который пробрасываются обработчики |

### Важные детали

- Для `DropdownMenu.Trigger` используется `onClick`.
- Для `ContextMenu.Trigger` используется `onContextMenu` (с `preventDefault()`).
- В оба trigger-компонента добавляются `aria-haspopup="menu"` и `aria-expanded`.
- Вызов через клавиатуру работает в обоих триггерах: `Shift+F10` и `ContextMenu`.

---

## `*.Content`

Компонент отображения меню:

- `DropdownMenu.Content`
- `ContextMenu.Content`

### Props

| Prop                  | Тип                                                                        | По умолчанию | Описание                                       |
| --------------------- | -------------------------------------------------------------------------- | ------------ | ---------------------------------------------- |
| `children`            | `React.ReactNode \| ((ctx: { closeMenu: () => void }) => React.ReactNode)` | —            | Контент меню или render-function с `closeMenu` |
| `className`           | `string`                                                                   | —            | Дополнительный CSS-класс контейнера меню       |
| `closeOnOutside`      | `boolean`                                                                  | `true`       | Закрывать ли меню при клике вне него           |
| `closeOnEscape`       | `boolean`                                                                  | `true`       | Закрывать ли меню по клавише `Escape`          |
| `disableOutsideClick` | `boolean`                                                                  | `false`      | Полностью выключить закрытие по клику снаружи  |

### Поведение по умолчанию

- Рендер в `document.body` через портал.
- Роль контейнера: `role="menu"`.
- Автофокус на первый доступный пункт меню.
- Навигация с клавиатуры:
- `ArrowDown`, `ArrowUp`
- `Home`, `End`
- `Escape`

---

## `*.Item`

Пункт меню:

- `DropdownMenu.Item`
- `ContextMenu.Item`

### Props

| Prop            | Тип                                              | По умолчанию | Описание                           |
| --------------- | ------------------------------------------------ | ------------ | ---------------------------------- |
| `children`      | `React.ReactNode`                                | —            | Текст/контент пункта               |
| `icon`          | `React.ReactNode`                                | —            | Иконка слева                       |
| `hotKey`        | `string`                                         | —            | Подсказка сочетания клавиш справа  |
| `className`     | `string`                                         | —            | Дополнительный CSS-класс           |
| `disabled`      | `boolean`                                        | `false`      | Блокирует выбор пункта             |
| `href`          | `string`                                         | —            | Рендер как `<a>` вместо `<button>` |
| `target`        | `string`                                         | —            | Атрибут ссылки                     |
| `rel`           | `string`                                         | —            | Атрибут ссылки                     |
| `closeOnSelect` | `boolean`                                        | `true`       | Закрывать меню после выбора        |
| `onSelect`      | `(event: React.MouseEvent<HTMLElement>) => void` | —            | Обработчик выбора                  |

### Поведение

- Если передан `href`, рендерится ссылка `<a role="menuitem">`.
- Если `href` не передан, рендерится `<button role="menuitem">`.
- Если `disabled`, выбор блокируется и закрытие не выполняется.

---

## `*.Separator`

Разделитель группы пунктов.

### Props

| Prop        | Тип      | По умолчанию | Описание                 |
| ----------- | -------- | ------------ | ------------------------ |
| `className` | `string` | —            | Дополнительный CSS-класс |

---

## `*.GroupLabel`

Лейбл группы пунктов.

### Props

| Prop        | Тип               | По умолчанию | Описание                 |
| ----------- | ----------------- | ------------ | ------------------------ |
| `children`  | `React.ReactNode` | —            | Текст группы             |
| `className` | `string`          | —            | Дополнительный CSS-класс |

---

## API: функциональный слой (`src/shared/lib/context-menu`)

Импорт:

```ts
import {
	initialMenuState,
	openMenu,
	closeMenu,
	toggleMenu,
	getMenuPointFromEvent,
	getMenuPointFromRect,
	createVirtualAnchor
} from "@/shared/lib/context-menu";
```

### Типы

```ts
interface MenuPoint {
	x: number;
	y: number;
}

type MenuOpenSource = "click" | "contextmenu" | "keyboard" | "programmatic";

type MenuAnchor = { type: "element"; element: HTMLElement } | { type: "point"; point: MenuPoint; contextElement?: Element | null };

interface MenuState {
	open: boolean;
	source: MenuOpenSource | null;
	anchor: MenuAnchor | null;
}

interface OpenMenuPayload {
	source: MenuOpenSource;
	anchor: MenuAnchor;
}
```

### Функции состояния

| Функция            | Сигнатура                                                   | Назначение                            |
| ------------------ | ----------------------------------------------------------- | ------------------------------------- |
| `initialMenuState` | `MenuState`                                                 | Начальное состояние закрытого меню    |
| `openMenu`         | `(payload: OpenMenuPayload) => MenuState`                   | Создать состояние открытого меню      |
| `closeMenu`        | `(state: MenuState) => MenuState`                           | Закрыть меню и очистить anchor/source |
| `toggleMenu`       | `(state: MenuState, payload: OpenMenuPayload) => MenuState` | Переключить состояние                 |

### Функции позиционирования

| Функция                 | Сигнатура                                                                                                                | Назначение                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `getMenuPointFromEvent` | `(event: { clientX: number; clientY: number }) => MenuPoint`                                                             | Получить координаты из mouse event       |
| `getMenuPointFromRect`  | `(rect: { left: number; top: number; width: number; height: number }) => MenuPoint`                                      | Получить центр прямоугольника            |
| `createVirtualAnchor`   | `(point: MenuPoint, contextElement?: Element \| null) => { getBoundingClientRect(): DOMRect; contextElement?: Element }` | Создать virtual anchor для `floating-ui` |

---

## Примеры использования

## 1) Controlled `DropdownMenu`

```tsx
const [open, setOpen] = useState(false);

return (
	<DropdownMenu open={open} onOpenChange={setOpen}>
		<DropdownMenu.Trigger>
			<button type="button">{open ? "Скрыть" : "Показать"} меню</button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onSelect={() => console.log("Edit")}>Редактировать</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => setOpen(false)}>Закрыть вручную</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu>
);
```

## 2) Controlled `ContextMenu`

```tsx
const [open, setOpen] = useState(false);

return (
	<ContextMenu open={open} onOpenChange={setOpen}>
		<ContextMenu.Trigger>
			<div tabIndex={0}>Правая кнопка мыши</div>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onSelect={() => alert("Открыть")}>Открыть</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu>
);
```

## 3) Группы, иконки, горячие клавиши

```tsx
<DropdownMenu>
	<DropdownMenu.Trigger>
		<button type="button">Меню</button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.GroupLabel>Документ</DropdownMenu.GroupLabel>
		<DropdownMenu.Item icon={<FilePenLine size={14} />} hotKey="Ctrl+E">
			Редактировать
		</DropdownMenu.Item>
		<DropdownMenu.Item icon={<Copy size={14} />} hotKey="Ctrl+C">
			Копировать
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.GroupLabel>Опасные</DropdownMenu.GroupLabel>
		<DropdownMenu.Item icon={<Trash2 size={14} />} hotKey="Del">
			Удалить
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu>
```

## 4) Пункт-ссылка

```tsx
<ContextMenu.Item href="/docs/123" target="_blank" rel="noreferrer">
	Открыть документацию
</ContextMenu.Item>
```

## 5) Оставлять меню открытым после выбора

```tsx
<DropdownMenu.Item closeOnSelect={false} onSelect={() => setFilter("active")}>
	Только активные
</DropdownMenu.Item>
```

## 6) Render-function контента с `closeMenu`

```tsx
<ContextMenu.Content>
	{({ closeMenu }) => (
		<div>
			<ContextMenu.Item onSelect={() => runCommand("rename")}>Переименовать</ContextMenu.Item>
			<button type="button" onClick={closeMenu}>
				Закрыть
			</button>
		</div>
	)}
</ContextMenu.Content>
```

## 7) Асинхронный `onSelect` с ручным закрытием

```tsx
<DropdownMenu.Item
	closeOnSelect={false}
	onSelect={async () => {
		await saveDraft();
		notify("Черновик сохранен");
	}}>
	Сохранить черновик
</DropdownMenu.Item>
```

## 8) Отключить закрытие по клику вне меню

```tsx
<DropdownMenu.Content disableOutsideClick closeOnEscape>
	<DropdownMenu.Item>Пункт</DropdownMenu.Item>
</DropdownMenu.Content>
```

## 9) Кастомные стили контейнера

```tsx
<ContextMenu.Content className="myContextMenu">
	<ContextMenu.Item>Кастомный пункт</ContextMenu.Item>
</ContextMenu.Content>
```

```scss
.myContextMenu {
	min-width: 18rem;
	max-width: 28rem;
}
```

## 10) Использование low-level функций `shared/lib/context-menu`

```ts
import { closeMenu, initialMenuState, openMenu, toggleMenu } from "@/shared/lib/context-menu";

let state = initialMenuState;

state = openMenu({
	source: "programmatic",
	anchor: {
		type: "point",
		point: { x: 100, y: 200 }
	}
});

state = toggleMenu(state, {
	source: "click",
	anchor: {
		type: "point",
		point: { x: 120, y: 220 }
	}
});

state = closeMenu(state);
```

---

## Доступность и клавиатура

- `Trigger` получает `aria-haspopup="menu"` и `aria-expanded`.
- Контент рендерится с `role="menu"`.
- Элементы действий рендерятся с `role="menuitem"`.
- Поддержка клавиш:
- `Shift+F10` / `ContextMenu` для открытия;
- `ArrowUp` / `ArrowDown` для перемещения;
- `Home` / `End` для перехода к первому/последнему пункту;
- `Escape` для закрытия.

---

## Storybook

Истории находятся в:

- `src/shared/ui/atomic/context-menu/stories/ContextMenu.stories.tsx`

Основные сценарии:

- `DropdownMenu / Базовый`
- `ContextMenu / По правому клику`
- `DropdownMenu / Контролируемый`

---

## Внутренние детали реализации

- Позиционирование: `@floating-ui/react`.
- Анимация открытия/закрытия: `motion/react` (`AnimatePresence`, `motion.div`).
- Для совместимости с анимацией позиционирование `floating-ui` переведено на `top/left` (`transform: false`), чтобы исключить конфликт `transform` со стороны `motion`.

---

## Тесты

Покрыты функциональные утилиты слоя `shared/lib/context-menu`:

- `src/shared/lib/context-menu/state.test.ts`
- `src/shared/lib/context-menu/anchor.test.ts`

Запуск:

```bash
npx vitest run src/shared/lib/context-menu/state.test.ts src/shared/lib/context-menu/anchor.test.ts
```
