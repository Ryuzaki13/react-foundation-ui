import { QrCode, type QrCodeError, type QrCodeProps } from "../src/qr-code";

const props: QrCodeProps = { value: "https://example.org/", alt: "Ссылка", errorCorrectionLevel: "M" };
const onError = (error: QrCodeError) => error.kind;

export const qrCode = <QrCode {...props} onError={onError} />;
// @ts-expect-error Описание назначения изображения обязательно.
export const missingAlt = <QrCode value="https://example.org/" />;
// @ts-expect-error Vendor options не являются public API компонента.
export const invalidLevel = <QrCode {...props} errorCorrectionLevel="arbitrary" />;
