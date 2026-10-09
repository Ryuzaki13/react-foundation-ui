# QrCode

`@ryuzaki13/react-foundation-ui/qr-code` локально кодирует строку в QR и показывает
доступное изображение. Реализация использует существующую dependency
`zxing-wasm/writer`, изолируя её экспериментальный API внутри компонента.

```tsx
import { QrCode } from "@ryuzaki13/react-foundation-ui/qr-code";

<QrCode value="https://example.org/" alt="QR-код ссылки на сайт" />;
```

`value` — непустая строка; `alt` — описание назначения, которое не должно
повторять секретный payload. `size` по умолчанию 256 CSS px, `errorCorrectionLevel`
по умолчанию `M`; доступны `L`, `M`, `Q`, `H`. Quiet zone и контрастное
чёрно-белое изображение сохраняются во всех темах. `className` применяется
к внешнему контейнеру, который сжимается по ширине родителя.

Первый server render нейтрален: WASM и Blob URL создаются только после mount.
WASM загружается с origin host-приложения через публичный package export
`zxing-wasm/writer/zxing_writer.wasm?url`, без CDN. Host-сборщик должен поддерживать
Vite-совместимый `?url` import, как уже требуется модулю `barcode-scanner`.
CSP host-приложения должна разрешать используемый им WebAssembly runtime
и `blob:` изображения.

`onError` получает только `{kind:"encoding-failed"}` либо `{kind:"unavailable"}`.
Первый вариант означает отказ кодирования, включая пустое/слишком длинное
значение; второй — недоступность runtime, Blob URL или изображения.
Исходные ошибки зависимости, причины и payload не передаются в diagnostics.
Изменение callback, alt, size или className не запускает повторное кодирование.

При изменении value/уровня коррекции старое изображение исчезает сразу; поздний
результат прежней генерации игнорируется. При смене значения и unmount Blob URL
освобождается. Компонент не хранит payload в browser storage и не передаёт его
по сети. Он не знает про auth, expiry, polling или user account: host-сценарий
должен убрать компонент, когда код больше нельзя показывать.

Проверки модуля покрывают безопасный SSR, реальные encode/decode, асинхронные
гонки, очистку URL, смену callback и безопасные категории ошибок. Storybook
содержит обычный код, длинное значение, ошибку и узкий контейнер.
