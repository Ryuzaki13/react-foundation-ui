# FullscreenPortal

Публичный импорт: `@ryuzaki13/react-foundation-ui/fullscreen-portal`.
Контракт `open`, `title`, `description`, `onOpenChange`, `children` сохранён.

Поверхность использует общий `useDocumentScrollLock` из foundation-lib, поэтому
вложенный Dialog или ModalManagerProvider не снимает блокировку родителя.
Обычный overlay-контейнер не создаёт второй lock. Геометрия overlay следует
visual viewport: размеру видимой области и её смещению при экранной клавиатуре.
Внутренняя панель сохраняет прежние отступы, рамку и немодальную focus policy.

Компонент не включает браузерный Fullscreen API и не выключает pinch zoom.
Layering относительно главного меню остаётся ответственностью tokens приложения.
Для Modal нужно подключить ModalManagerProvider; разные собственные body locks
не могут координироваться с общим foundation ref-count.

Проверки JSDOM не воспроизводят реальную iOS клавиатуру. После подключения версии
нужна проверка физического Safari: открытие клавиатуры, pan, вложенный dialog,
закрытие клавиатуры и возврат к исходной прокрутке документа.
