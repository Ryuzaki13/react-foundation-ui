/** Статусы изображения, которыми обмениваются hook генерации и компонент. */
export const QR_CODE_STATUS_LOADING = "loading";
export const QR_CODE_STATUS_READY = "ready";
export const QR_CODE_STATUS_ERROR = "error";

/** Безопасные причины ошибки общие для генерации, показа и публичного результата. */
export const QR_CODE_ERROR_UNAVAILABLE = "unavailable";
export const QR_CODE_ERROR_ENCODING_FAILED = "encoding-failed";
export const QR_CODE_DEFAULT_CORRECTION_LEVEL = "M";
