# Редактор таблиц

Public API: `@ryuzaki13/react-foundation-ui/table-editor`. Требуется
`react-foundation-lib >=2.3.0` и TanStack Table 9 с cell spanning.

Минимальная peer-версия `react-foundation-lib` повышена до 2.3.0 для всего
UI-пакета. Поэтому выпуск оформляется major, хотя API остальных компонентов
не меняется: существующие consumers должны явно обновить пару зависимостей.

`useTableEditor(initialDocument)` владеет только локальным draft, выделением и
100 шагами undo/redo. `TableEditor` принимает этот controller, `renderCell`, `getCellText`,
`renderValueEditor`, `createEmptyValue` и `disabled`. Пример host-композиции —
`stories/TableEditorDemo.tsx`. Для загрузки другого документа нужен новый key;
refetch сам по себе намеренно не меняет открытый draft.

Пакет не сохраняет данные и не знает KTK, permissions, Query, Lexical Raw или
документы колледжа. Host читает `editor.document` при явном сохранении, проверяет
данные и обрабатывает серверную версию/конфликт. Значение ячейки — generic.

Сетка использует TanStack 9: accessor содержит identity anchor, поэтому
совпадение текста не создаёт случайных объединений. Полная матрица сохраняется
в документе; отображение скрытых ячеек определяется spans. Поддержаны стрелки,
Home/End, Shift-выделение и отдельный переключатель диапазона для touch.
Preview ячеек inert: ссылки внутри него не перехватывают выделение.

Строки заголовка видны во время редактирования даже при `hideHeaders` — флаг
относится к публикации. Перемещение и удаление учитывают неразрывные группы;
удаление требует подтверждения. Reorder доступен кнопками, не требует drag.
DnD, clipboard/HTML-import и persistence истории между запусками не входят
в первый UI-срез. Это не утверждение о полной миграции legacy-сценариев.
