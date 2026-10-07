# StablePortal

`@ryuzaki13/react-foundation-ui/stable-portal` переносит один React subtree
между подключёнными DOM-областями без смены portal container и React identity.
Используйте его для содержимого, которое должно переходить между ячейкой,
немодальным окном и полноэкранной поверхностью без потери локального черновика.

```tsx
import { StablePortal } from "@ryuzaki13/react-foundation-ui/stable-portal";

<StablePortal target={activeTarget}>
	<Editor />
</StablePortal>;
```

## Контракт

- `target: HTMLElement | null` — подключённый host того же `document`.
- `children: ReactNode` — единственное переносимое содержимое.
- Сам `StablePortal` должен оставаться mounted над меняющимися host-компонентами.
  Его удаление или смена `key` завершает lifetime subtree.
- `target=null` переносит контейнер в скрытую `inert` parking-область. Дочерние
  React state/effects остаются mounted; это не автоматическая приостановка
  сетевых запросов, realtime-interest, таймеров или прикладного read marking.
  Передавайте видимость соответствующим владельцам этих механизмов отдельно.
- Технический контейнер имеет `display:contents` и не создаёт layout-box. Размер,
  scroll-policy, z-index, модальность и keyboard-dismiss принадлежат host.
- Перенос сохраняет DOM-input, локальное состояние и subscriptions; восстанавливает
  ненулевые scroll positions и focus/selection переносимого содержимого. После
  parking не забирает фокус у другого уже сфокусированного control. Изменение
  размеров нового host может естественно ограничить доступную прокрутку.
- Содержимое не может стать собственным target; чужой `document` и неподключённый
  target отклоняются до изменения DOM. Перед удалением host передайте `null`
  либо следующий подключённый target.
- React event bubbling и context остаются у исходного React-владельца, а не
  у физического DOM-host. Например, `onKeyDown` оболочки окна не становится
  React-родителем переносимого редактора. Keyboard/focus wiring необходимо
  согласовывать у постоянного владельца или через нативную DOM-boundary.
- Вложенные React portals сохраняют собственный lifetime. Их видимость и закрытие
  остаются у владельца; `inert` parking родителя не скрывает независимый portal.
- SSR и initial hydration возвращают пустой render; browser container создаётся
  после commit публичным lifecycle Floating UI. Содержимое требует клиентского
  DOM и не используется как замена SSR основной страницы.

## Проверки

Тесты покрывают state/draft/scroll/focus/selection, однократную subscription,
parking, вложенный portal, React event ancestry, StrictMode, SSR/hydration и
отклонение неверных targets. Storybook `Layout/StablePortal` позволяет проверить
перенос между обычной ячейкой, `FloatingWindow` и `FullscreenPortal`.
