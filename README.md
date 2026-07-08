# @ryuzaki13/react-foundation-ui

Библиотечный пакет React UI primitives, выделенный из бывшего `src/shared/ui`.

Пакет не открывает корневой импорт. Используйте точечные entrypoints:

```tsx
import "@ryuzaki13/react-foundation-ui/styles.css";
import { Button } from "@ryuzaki13/react-foundation-ui/button";
```

Если host-проект задает собственные значения CSS-переменных, подключайте Sass API вместо готового CSS:

```scss
@use "@ryuzaki13/react-foundation-ui/styles/config" with (
	$root-token-overrides: (
		"--font-family": ("Inter", sans-serif),
		"--radius-md": 8px
	),
	$light-theme-overrides: (
		tokens: (
			"--surface-0": #ffffff,
			"--surface-1": #f5f7fb
		)
	)
);

@use "@ryuzaki13/react-foundation-ui/styles.scss";
```

В одном приложении нужно выбрать один способ: либо `styles.css` с дефолтными токенами, либо Sass entrypoint с настройкой через `styles/config`.

Для host-проектов со своим реестром тем используйте `@ryuzaki13/react-foundation-ui/styles/foundation`: он подключает root tokens и utility-классы без дефолтных `data-theme` selectors из UI-пакета.

Stories публикуются отдельными subpath exports рядом с компонентами, например `@ryuzaki13/react-foundation-ui/button/stories/Button.stories`.

UI зависит от `@ryuzaki13/react-foundation-lib` и не включает API-bound OData wrappers в публичную сборку.
