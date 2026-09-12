# Замена цветовых токенов

Новый контракт темы содержит семь схем: `accent`, `brand`, `neutral`, `error`, `warning`, `success`, `info`. Каждая схема принимает четыре настраиваемые роли:

- `--<tone>-text` — текст и иконка на обычной поверхности;
- `--<tone>-border` — рамка;
- `--<tone>-fill` — заливка;
- `--<tone>-on-fill` — текст и иконка поверх заливки.

Ниже приведена полная карта прежнего публичного контракта. Совместимые aliases в UI-пакете намеренно не оставлены.

## Основные роли

```text
--status-brand-text: --brand-text
--status-brand-border: --brand-border
--status-brand-fill: --brand-fill
--status-brand-on-fill: --brand-on-fill
--status-neutral-text: --neutral-text
--status-neutral-border: --neutral-border
--status-neutral-fill: --neutral-fill
--status-neutral-on-fill: --neutral-on-fill
--status-error-text: --error-text
--status-error-border: --error-border
--status-error-fill: --error-fill
--status-error-on-fill: --error-on-fill
--status-warning-text: --warning-text
--status-warning-border: --warning-border
--status-warning-fill: --warning-fill
--status-warning-on-fill: --warning-on-fill
--status-success-text: --success-text
--status-success-border: --success-border
--status-success-fill: --success-fill
--status-success-on-fill: --success-on-fill
--status-info-text: --info-text
--status-info-border: --info-border
--status-info-fill: --info-fill
--status-info-on-fill: --info-on-fill
```

## Производные состояния

Hover, active и soft не входят в карту `status`, но снова доступны как публичные генерируемые CSS-токены. UI-пакет вычисляет их через единые `color-mix(in srgb, ...)` из четырёх основных ролей. Карта `tokens` остаётся последним escape hatch, если приложению действительно требуется точное переопределение.

```text
--status-brand-text-hover: --brand-text-hover
--status-brand-text-active: --brand-text-active
--status-brand-border-hover: --brand-border-hover
--status-brand-border-active: --brand-border-active
--status-brand-border-focus: --focus-ring
--status-brand-fill-hover: --brand-fill-hover
--status-brand-fill-active: --brand-fill-active
--status-brand-soft: --brand-soft
--status-neutral-text-hover: --neutral-text-hover
--status-neutral-text-active: --neutral-text-active
--status-neutral-border-hover: --neutral-border-hover
--status-neutral-border-active: --neutral-border-active
--status-neutral-border-focus: --focus-ring
--status-neutral-fill-hover: --neutral-fill-hover
--status-neutral-fill-active: --neutral-fill-active
--status-neutral-soft: --neutral-soft
--status-error-text-hover: --error-text-hover
--status-error-text-active: --error-text-active
--status-error-border-hover: --error-border-hover
--status-error-border-active: --error-border-active
--status-error-border-focus: --focus-ring
--status-error-fill-hover: --error-fill-hover
--status-error-fill-active: --error-fill-active
--status-error-soft: --error-soft
--status-warning-text-hover: --warning-text-hover
--status-warning-text-active: --warning-text-active
--status-warning-border-hover: --warning-border-hover
--status-warning-border-active: --warning-border-active
--status-warning-border-focus: --focus-ring
--status-warning-fill-hover: --warning-fill-hover
--status-warning-fill-active: --warning-fill-active
--status-warning-soft: --warning-soft
--status-success-text-hover: --success-text-hover
--status-success-text-active: --success-text-active
--status-success-border-hover: --success-border-hover
--status-success-border-active: --success-border-active
--status-success-border-focus: --focus-ring
--status-success-fill-hover: --success-fill-hover
--status-success-fill-active: --success-fill-active
--status-success-soft: --success-soft
--status-info-text-hover: --info-text-hover
--status-info-text-active: --info-text-active
--status-info-border-hover: --info-border-hover
--status-info-border-active: --info-border-active
--status-info-border-focus: --focus-ring
--status-info-fill-hover: --info-fill-hover
--status-info-fill-active: --info-fill-active
--status-info-soft: --info-soft
```

## Accent и прежние interactive-токены

```text
--content-accent: --accent-text
--border-accent: --accent-border
--surface-accent: --accent-fill
--interactive-color: удалён; обычное свойство color самого компонента
--interactive-surface: удалён; обычное свойство background-color самого компонента
--interactive-border: удалён; обычное свойство border-color самого компонента
--interactive-hover-color: --accent-on-fill
--interactive-active-color: --accent-on-fill
--interactive-selected-color: --accent-on-fill
--interactive-hover-surface: --accent-fill
--interactive-active-surface: --accent-fill
--interactive-selected-surface: --accent-fill
--interactive-hover-border: --accent-border
--interactive-active-border: --accent-border
--interactive-selected-border: --accent-border
отсутствовал: --accent-on-fill
```

`interactiveSurface` намеренно использует базовые `--accent-fill`, `--accent-border` и `--accent-on-fill` для hover, active и selected: это единое заполненное состояние выбора. Производные `--accent-*-hover` и `--accent-*-active` предназначены для компонентов, которые меняют уже заданный tone между состояниями.

## High contrast

```text
--hc-status-brand-text: --hc-brand-text
--hc-status-brand-border: --hc-brand-border
--hc-status-brand-fill: --hc-brand-fill
--hc-status-brand-on-fill: --hc-brand-on-fill
--hc-status-brand-soft: удалён; --brand-soft вычисляется из high-contrast-aware --brand-fill
--hc-status-neutral-text: --hc-neutral-text
--hc-status-neutral-border: --hc-neutral-border
--hc-status-neutral-fill: --hc-neutral-fill
--hc-status-neutral-on-fill: --hc-neutral-on-fill
--hc-status-neutral-soft: удалён; --neutral-soft вычисляется из high-contrast-aware --neutral-fill
--hc-status-error-text: --hc-error-text
--hc-status-error-border: --hc-error-border
--hc-status-error-fill: --hc-error-fill
--hc-status-error-on-fill: --hc-error-on-fill
--hc-status-error-soft: удалён; --error-soft вычисляется из high-contrast-aware --error-fill
--hc-status-warning-text: --hc-warning-text
--hc-status-warning-border: --hc-warning-border
--hc-status-warning-fill: --hc-warning-fill
--hc-status-warning-on-fill: --hc-warning-on-fill
--hc-status-warning-soft: удалён; --warning-soft вычисляется из high-contrast-aware --warning-fill
--hc-status-success-text: --hc-success-text
--hc-status-success-border: --hc-success-border
--hc-status-success-fill: --hc-success-fill
--hc-status-success-on-fill: --hc-success-on-fill
--hc-status-success-soft: удалён; --success-soft вычисляется из high-contrast-aware --success-fill
--hc-status-info-text: --hc-info-text
--hc-status-info-border: --hc-info-border
--hc-status-info-fill: --hc-info-fill
--hc-status-info-on-fill: --hc-info-on-fill
--hc-status-info-soft: удалён; --info-soft вычисляется из high-contrast-aware --info-fill

--hc-content-accent: --hc-accent-text
--hc-border-accent: --hc-accent-border
--hc-surface-accent: --hc-accent-fill
отсутствовал: --hc-accent-on-fill

--hc-surface: --hc-surface-0, --hc-surface-1, --hc-surface-2
--hc-content: --hc-content-0, --hc-content-1, --hc-content-2
--hc-border: --hc-border-0, --hc-border-1, --hc-border-2

отсутствовал: --hc-white
отсутствовал: --hc-black
отсутствовал: --hc-shadow-xs
отсутствовал: --hc-shadow-sm
отсутствовал: --hc-shadow-md
отсутствовал: --hc-shadow-lg
```

`--hc-focus-ring`, `--hc-border-focus`, `--hc-overlay-backdrop` и `--hc-overlay-glass` сохраняют имена.

## Полный новый контракт семантических схем

```text
--accent-text
--accent-border
--accent-fill
--accent-on-fill
--brand-text
--brand-border
--brand-fill
--brand-on-fill
--neutral-text
--neutral-border
--neutral-fill
--neutral-on-fill
--error-text
--error-border
--error-fill
--error-on-fill
--warning-text
--warning-border
--warning-fill
--warning-on-fill
--success-text
--success-border
--success-fill
--success-on-fill
--info-text
--info-border
--info-fill
--info-on-fill
```

Для каждой из семи схем `--<tone>-*` дополнительно выводятся производные токены:

```text
--<tone>-text-hover
--<tone>-text-active
--<tone>-border-hover
--<tone>-border-active
--<tone>-fill-hover
--<tone>-fill-active
--<tone>-soft
```

Эти 49 значений не являются входом Sass-карты `status`. Отдельные `--hc-<tone>-*` для них не нужны: формулы используют первичные токены, которые уже учитывают high-contrast overrides.

Первичное объявление каждого цвета имеет форму `--token: var(--hc-token, #hex)`. Это правило автоматически применяется к цветовым значениям в картах `tokens` и `status`. Contrast-режим задаёт только `--hc-*`, а обычная тема продолжает использовать hex fallback.

## Sass-конфигурация

Прежние OKLCH seeds, вложенные scales и отдельная карта `accent` удалены. Новая форма переопределения:

```scss
status: (
	accent: (
		text: #9a3412,
		border: #ea580c,
		fill: #ffedd5,
		on-fill: #431407
	),
	error: (
		text: #b91c1c,
		border: #b91c1c,
		fill: #dc2626,
		on-fill: #ffffff
	)
);
```
