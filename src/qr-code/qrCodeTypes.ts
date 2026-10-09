/** Без исходного payload, vendor message и cause: значение QR может содержать одноразовый секрет. */
export type QrCodeError = Readonly<{ kind: "unavailable" | "encoding-failed" }>;

export type QrCodeProps = Readonly<{
	/** Кодируемая строка. Компонент не записывает её в storage, diagnostics или сетевые запросы. */
	value: string;
	/** Доступное описание назначения QR; не передавайте сюда секретное значение из value. */
	alt: string;
	/** Сторона квадрата в CSS px; по умолчанию 256. Неположительное/нечисловое значение заменяется на 256. */
	size?: number;
	/** Уровень коррекции ошибок. По умолчанию M; quiet zone сохраняется при любом уровне. */
	errorCorrectionLevel?: "L" | "M" | "Q" | "H";
	className?: string;
	/** Сообщает только безопасную категорию ошибки; изменение callback не запускает повторное кодирование. */
	onError?: (error: QrCodeError) => void;
}>;
