# Миграция цветовых токенов

Публичный mixin `theme($mode, $overrides: ())` сохраняется. Он принимает `light` или `dark` и единственный раздел `tokens` с явными CSS-переменными. Исходные палитры обоих режимов находятся в [`src/styles/config/_index.scss`](src/styles/config/_index.scss). Тёмная палитра перенесена из Storybook; светлая является начальной версией для настройки и визуальной проверки.

Пакет больше не генерирует цветовые роли и состояния из базовых цветов. Hover и pressed настраиваются независимо. Прежний раздел `status` отклоняется через Sass `@error`; совместимые алиасы не создаются. Старые наборы из четырёх ролей, токены `*-active` и `*-soft` больше не входят в контракт темы.

## Текущие группы

Оба режима содержат одинаковый набор цветовых токенов:

| Группа | Токены |
| --- | --- |
| Поверхности | `--bg-canvas`, `--bg-surface`, `--bg-elevated`, `--bg-sunken`, `--bg-hover`, `--bg-pressed`, `--bg-accent`, `--bg-disabled`, `--bg-overlay` |
| Текст | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-disabled`, `--text-inverse`, `--text-link`, `--text-link-hover` |
| Акцент | `--accent-text`, `--accent-border`, `--accent-fill`, их `-hover` / `-pressed`, а также `--accent-on-fill` |
| Границы | `--border-subtle`, `--border-default`, `--border-strong`, `--border-interactive` и его `-hover` / `-pressed` / `-disabled`, `--border-decorative` |
| Фокус | `--focus-ring` |
| Мягкая выбранность | `--selection-bg`, `--selection-text`, `--selection-border`, их `-hover` / `-pressed` / `-disabled` |
| Насыщенная выбранность | `--selection-fill` и его `-hover` / `-pressed` / `-disabled`, `--selection-on-fill`, `--selection-on-fill-disabled` |
| Выделение текста | `--text-selection-bg`, `--text-selection-text` |
| Подсветка | `--highlight-bg`, `--highlight-text`, `--highlight-border`, их `-current` |
| Статусы | Для каждого из `success`, `warning`, `error`, `info`: `--<status>-text`, `--<status>-bg` и его `-hover` / `-pressed`, `--<status>-fill` и его `-hover` / `-pressed`, `--<status>-on-fill` |
| Градиенты | `--gradient-accent`, `--gradient-surface`, `--gradient-page-glow` |
| Тени и свечение | `--shadow-card`, `--shadow-popover`, `--glow-brand`, `--glow-selection`, `--glow-focus`, `--glow-highlight` |

Назначения семантических ролей описаны в [семантическом контракте](src/styles/config/semantic-color-tokens.md). Части и состояния настраиваются независимо: текст на обычной поверхности использует `accent-text`, а содержимое на насыщенной заливке — `accent-on-fill`. Выбранность сохраняется при недоступности через соответствующие `selection-*-disabled`; готовые цвета не умножаются на `--disabled-opacity`.

`--<status>-bg` задаёт мягкий фон outline/soft. Текст и рамка используют один `--<status>-text` во всех состояниях, а меняется только `bg`. Solid использует насыщенный `--<status>-fill` и постоянный `--<status>-on-fill`; меняется только `fill`. Цвета обеих пар и hover/pressed задаются явно и независимо. Недоступный статусный контрол переходит на нейтральные disabled-роли.

`brand` удалён из `UiTone` и `TextColor`: выразительное оформление использует `accent` и `--accent-*`, без автоматической семантики выбранности. `UiAppearance` содержит `solid`, `outline` и `ghost`; дублирующий `transparent` удалён, его прежние использования заменяются на `ghost`.

Нейтральный вариант использует обычную поверхность и интерактивную рамку, либо `ghost` с прозрачными фоном и рамкой. Отдельного нейтрального solid нет: переданные `solid` и `outline` не меняют обычное оформление `neutral`.

Размеры, интервалы, типографика и слои остаются в корневой конфигурации. Для них используются `$root-token-overrides`, `$retina-token-overrides` и карты пресетов, отдельно от палитры режима.

## Настройка host-проекта

Настройте `styles/config` до первого подключения любых стилей foundation в Sass-графе:

```scss
@use "@ryuzaki13/react-foundation-ui/styles/config" with (
	$light-theme-overrides: (
		tokens: (
			"--bg-canvas": #ffffff,
			"--text-primary": #17243b
		)
	),
	$dark-theme-overrides: (
		tokens: (
			"--bg-canvas": #101526,
			"--accent-fill": #f7ff4a,
			"--accent-fill-hover": #fcff8a,
			"--accent-fill-pressed": #dbe532,
			"--accent-on-fill": #0a1020
		)
	)
);

@use "@ryuzaki13/react-foundation-ui/styles/foundation";
@use "@ryuzaki13/react-foundation-ui/styles/themes" as foundationThemes;

:root[data-theme="light:default"] {
	color-scheme: light;

	@include foundationThemes.theme(light);
}

:root[data-theme="dark:default"] {
	color-scheme: dark;

	@include foundationThemes.theme(dark);
}

:root[data-theme="dark:custom"] {
	color-scheme: dark;

	@include foundationThemes.theme(
		dark,
		(
			tokens: (
				"--bg-canvas": #14102a,
				"--accent-fill": #e5d0ff,
				"--accent-fill-hover": #f1e3ff,
				"--accent-fill-pressed": #c8a8ed,
				"--accent-on-fill": #14102a
			)
		)
	);
}
```

Приоритет: **дефолтные значения режима < переопределения config < переопределения вызова mixin**. Неуказанные токены наследуются из выбранной палитры; каждое итоговое свойство выводится один раз. Переопределения одного вызова не изменяют другие темы. Host-проект владеет селекторами и переключением режима.

Для Sass-значений типа `color` сохраняется форма `--token: var(--hc-token, <цвет>)`. Контрастный режим может задавать соответствующие `--hc-*` явно. Ссылки `var(...)`, градиенты и другие составные значения выводятся как переданы; отдельные состояния контрастности из них не генерируются.

## Порядок миграции

1. Найдите в host-конфигурации раздел `status` и перенесите значения в `tokens`, выбирая текущую роль по назначению элемента.
2. Проверьте ссылки на прежние CSS-переменные в компонентах, глобальных стилях и контрастных темах. Механической замены по суффиксу недостаточно: набор ролей и смысл заливок изменились.
3. Задайте нужные hover и pressed явно для каждой темы. Удалите ожидания автоматического расчёта `active`, `soft`, рамок и текста поверх заливки.
4. Соберите Sass и проверьте обе темы, состояния элементов, выделение и контрастный режим. Светлую палитру отдельно уточните под интерфейс host-проекта.

Статусные `tone` и их `appearance` используют новый контракт; старые имена `--<status>-hover` и `--<status>-pressed` удалены. Приложения-потребители и их палитры требуют отдельного обновления. До публикации версии пакета нужно проверить оставшиеся ссылки внутри UI-пакета и обновить использующие его приложения; незавершённые участки требуют отдельной правки.
