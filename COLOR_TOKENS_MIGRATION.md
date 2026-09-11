# Замена цветовых токенов

Новый контракт темы содержит семь схем: `accent`, `brand`, `neutral`, `error`, `warning`, `success`, `info`. Каждая схема имеет четыре роли:

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

Hover, active и soft больше не являются токенами темы. UI-компоненты вычисляют их через `color-mix(in srgb, ...)` из четырёх основных ролей.

```text
--status-brand-text-hover: удалён; вычисляется из --brand-text
--status-brand-text-active: удалён; вычисляется из --brand-text
--status-brand-border-hover: удалён; вычисляется из --brand-border
--status-brand-border-active: удалён; вычисляется из --brand-border
--status-brand-border-focus: --focus-ring
--status-brand-fill-hover: удалён; вычисляется из --brand-fill
--status-brand-fill-active: удалён; вычисляется из --brand-fill
--status-brand-soft: удалён; вычисляется из --brand-fill
--status-neutral-text-hover: удалён; вычисляется из --neutral-text
--status-neutral-text-active: удалён; вычисляется из --neutral-text
--status-neutral-border-hover: удалён; вычисляется из --neutral-border
--status-neutral-border-active: удалён; вычисляется из --neutral-border
--status-neutral-border-focus: --focus-ring
--status-neutral-fill-hover: удалён; вычисляется из --neutral-fill
--status-neutral-fill-active: удалён; вычисляется из --neutral-fill
--status-neutral-soft: удалён; вычисляется из --neutral-fill
--status-error-text-hover: удалён; вычисляется из --error-text
--status-error-text-active: удалён; вычисляется из --error-text
--status-error-border-hover: удалён; вычисляется из --error-border
--status-error-border-active: удалён; вычисляется из --error-border
--status-error-border-focus: --focus-ring
--status-error-fill-hover: удалён; вычисляется из --error-fill
--status-error-fill-active: удалён; вычисляется из --error-fill
--status-error-soft: удалён; вычисляется из --error-fill
--status-warning-text-hover: удалён; вычисляется из --warning-text
--status-warning-text-active: удалён; вычисляется из --warning-text
--status-warning-border-hover: удалён; вычисляется из --warning-border
--status-warning-border-active: удалён; вычисляется из --warning-border
--status-warning-border-focus: --focus-ring
--status-warning-fill-hover: удалён; вычисляется из --warning-fill
--status-warning-fill-active: удалён; вычисляется из --warning-fill
--status-warning-soft: удалён; вычисляется из --warning-fill
--status-success-text-hover: удалён; вычисляется из --success-text
--status-success-text-active: удалён; вычисляется из --success-text
--status-success-border-hover: удалён; вычисляется из --success-border
--status-success-border-active: удалён; вычисляется из --success-border
--status-success-border-focus: --focus-ring
--status-success-fill-hover: удалён; вычисляется из --success-fill
--status-success-fill-active: удалён; вычисляется из --success-fill
--status-success-soft: удалён; вычисляется из --success-fill
--status-info-text-hover: удалён; вычисляется из --info-text
--status-info-text-active: удалён; вычисляется из --info-text
--status-info-border-hover: удалён; вычисляется из --info-border
--status-info-border-active: удалён; вычисляется из --info-border
--status-info-border-focus: --focus-ring
--status-info-fill-hover: удалён; вычисляется из --info-fill
--status-info-fill-active: удалён; вычисляется из --info-fill
--status-info-soft: удалён; вычисляется из --info-fill
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

## High contrast

```text
--hc-status-brand-text: --hc-brand-text
--hc-status-brand-border: --hc-brand-border
--hc-status-brand-fill: --hc-brand-fill
--hc-status-brand-on-fill: --hc-brand-on-fill
--hc-status-brand-soft: удалён; мягкая заливка вычисляется из --brand-fill
--hc-status-neutral-text: --hc-neutral-text
--hc-status-neutral-border: --hc-neutral-border
--hc-status-neutral-fill: --hc-neutral-fill
--hc-status-neutral-on-fill: --hc-neutral-on-fill
--hc-status-neutral-soft: удалён; мягкая заливка вычисляется из --neutral-fill
--hc-status-error-text: --hc-error-text
--hc-status-error-border: --hc-error-border
--hc-status-error-fill: --hc-error-fill
--hc-status-error-on-fill: --hc-error-on-fill
--hc-status-error-soft: удалён; мягкая заливка вычисляется из --error-fill
--hc-status-warning-text: --hc-warning-text
--hc-status-warning-border: --hc-warning-border
--hc-status-warning-fill: --hc-warning-fill
--hc-status-warning-on-fill: --hc-warning-on-fill
--hc-status-warning-soft: удалён; мягкая заливка вычисляется из --warning-fill
--hc-status-success-text: --hc-success-text
--hc-status-success-border: --hc-success-border
--hc-status-success-fill: --hc-success-fill
--hc-status-success-on-fill: --hc-success-on-fill
--hc-status-success-soft: удалён; мягкая заливка вычисляется из --success-fill
--hc-status-info-text: --hc-info-text
--hc-status-info-border: --hc-info-border
--hc-status-info-fill: --hc-info-fill
--hc-status-info-on-fill: --hc-info-on-fill
--hc-status-info-soft: удалён; мягкая заливка вычисляется из --info-fill

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
