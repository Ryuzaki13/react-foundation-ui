# Миграция цветовых токенов

Публичный mixin `theme($mode, $overrides: ())` сохраняется. Он принимает `light` или `dark` и единственный раздел `tokens` с явными CSS-переменными. Исходные палитры обоих режимов находятся в [`src/styles/config/_index.scss`](src/styles/config/_index.scss). Тёмная палитра перенесена из Storybook; светлая является начальной версией для настройки и визуальной проверки.

Пакет больше не генерирует цветовые роли и состояния из базовых цветов. Hover и pressed настраиваются независимо. Прежний раздел `status` отклоняется через Sass `@error`; совместимые алиасы не создаются. Старые наборы из четырёх ролей, токены `*-active` и `*-soft` больше не входят в контракт темы.

## Текущие группы

Оба режима содержат одинаковый набор цветовых токенов:

| Группа          | Токены                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Поверхности     | `--bg-canvas`, `--bg-surface`, `--bg-elevated`, `--bg-sunken`, `--bg-hover`, `--bg-pressed`, `--bg-accent`, `--bg-disabled`, `--bg-overlay`                                                 |
| Текст           | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-disabled`, `--text-inverse`, `--text-link`, `--text-link-hover`                                                               |
| Границы и фокус | `--border-subtle`, `--border-default`, `--border-strong`, `--border-interactive`, `--border-hover`, `--border-accent`, `--focus-ring`                                                       |
| Акценты         | `--accent-brand`, `--accent-brand-hover`, `--accent-brand-pressed`, `--accent-selection`, `--accent-selection-hover`, `--accent-selection-pressed`, `--accent-focus`, `--accent-decorative` |
| Выделение       | `--selection-bg`, `--selection-bg-hover`, `--selection-text`, `--selection-border`, `--text-selection-bg`, `--text-selection-text`                                                          |
| Статусы         | Для каждого из `success`, `warning`, `error`, `info`: `--<status>-text`, `--<status>-fill`, `--<status>-fill-hover`, `--<status>-fill-pressed`                                              |
| Градиенты       | `--gradient-accent`, `--gradient-surface`, `--gradient-page-glow`                                                                                                                           |
| Тени и свечение | `--shadow-card`, `--shadow-popover`, `--glow-lemon`, `--glow-fuchsia`, `--glow-cyan`, `--glow-title`                                                                                        |

`--<status>-fill` задаёт мягкий фон статуса напрямую. Цвета текста, hover и pressed задаются отдельно и не пересчитываются при изменении fill. Явные ссылки вроде `--border-accent: var(--accent-selection)` сохраняют обычную CSS-зависимость от указанного токена.

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
			"--accent-brand": #f7ff4a,
			"--accent-brand-hover": #fcff8a,
			"--accent-brand-pressed": #dbe532
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
				"--accent-brand": #e5d0ff,
				"--accent-brand-hover": #f1e3ff,
				"--accent-brand-pressed": #c8a8ed
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

Наличие новых палитр не означает, что все компоненты и приложения-потребители уже мигрированы. До публикации версии пакета нужно проверить оставшиеся ссылки внутри UI-пакета и обновить использующие его приложения; незавершённые участки требуют отдельной правки.
