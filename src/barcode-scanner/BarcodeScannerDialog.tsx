import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { prepareZXingModule, Scanner, type IDetectedBarcode, type IScannerError, type IScannerHandle } from "@yudiel/react-qr-scanner";
import zxingReaderWasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";

import { Button } from "../button";
import { Modal, ModalContent } from "../modal";

import styles from "./BarcodeScannerDialog.module.scss";

/**
 * Полифилл должен получать WASM из npm-артефакта foundation UI, чтобы первое
 * сканирование не зависело от доступности внешнего CDN и работало в PWA offline.
 */
prepareZXingModule({
	overrides: {
		locateFile: (path: string, prefix: string) => (path.endsWith(".wasm") ? zxingReaderWasmUrl : `${prefix}${path}`)
	}
});

type ScannerFormats = NonNullable<ComponentProps<typeof Scanner>["formats"]>;

export type BarcodeScannerFormat = ScannerFormats[number];
export type BarcodeScannerErrorKind = IScannerError["kind"];
export type BarcodeScannerError = Readonly<IScannerError>;

export type BarcodeScanResult = {
	readonly value: string;
	readonly format: string;
};

export type BarcodeScannerControls = {
	readonly finder?: boolean;
	readonly torch?: boolean;
	readonly zoom?: boolean;
};

export type BarcodeScannerDialogProps = {
	/** Вызывается один раз для первого распознанного кода. */
	readonly onDetected: (result: BarcodeScanResult) => void;
	/** Закрывает пользовательский сценарий и вызывается также после успешного сканирования. */
	readonly onClose: () => void;
	/** Получает исходную типизированную ошибку камеры для диагностики host-приложения. */
	readonly onError?: (error: BarcodeScannerError) => void;
	/** Ограничивает распознавание нужными форматами и уменьшает ложные совпадения. */
	readonly formats?: readonly BarcodeScannerFormat[];
	/** Настройки предпочитаемой камеры и разрешения видеопотока. */
	readonly constraints?: MediaTrackConstraints;
	/** Встроенные элементы управления сканера. */
	readonly controls?: BarcodeScannerControls;
	/** Звуковое подтверждение или URL собственного звука. */
	readonly sound?: boolean | string;
	/** Закрывает камеру при сворачивании вкладки или установленной PWA. */
	readonly closeWhenDocumentHidden?: boolean;
	readonly title?: string;
	readonly hint?: ReactNode;
	readonly retryLabel?: string;
	readonly errorMessages?: Partial<Record<BarcodeScannerErrorKind, string>>;
	readonly className?: string;
};

const defaultFormats = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] satisfies BarcodeScannerFormat[];

const defaultConstraints = {
	facingMode: { ideal: "environment" },
	width: { ideal: 1280 },
	height: { ideal: 720 }
} satisfies MediaTrackConstraints;

const defaultControls = {
	finder: true,
	torch: true,
	zoom: true
} satisfies BarcodeScannerControls;

const defaultErrorMessages = {
	"permission-denied": "Доступ к камере запрещён. Разрешите его в настройках сайта.",
	"no-camera": "На устройстве не найдена камера.",
	"in-use": "Камера уже используется другим приложением или вкладкой.",
	overconstrained: "Камера не поддерживает запрошенные параметры.",
	"insecure-context": "Для работы камеры необходим HTTPS.",
	unsupported: "Этот браузер не поддерживает доступ к камере.",
	aborted: "Запуск камеры был прерван.",
	security: "Доступ к камере заблокирован политикой безопасности.",
	"type-error": "Переданы некорректные параметры камеры.",
	unknown: "Не удалось запустить сканер."
} satisfies Record<BarcodeScannerErrorKind, string>;

function stopMediaStream(stream: MediaStream | null | undefined) {
	stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Одноразовый сканер штрихкодов в модальном окне. Компонент монтируется только
 * после явного действия пользователя, освобождает MediaStream до закрытия и
 * сохраняет ссылку на поток на случай, если дочерний Scanner уже очистил ref.
 */
export function BarcodeScannerDialog({
	onDetected,
	onClose,
	onError,
	formats = defaultFormats,
	constraints = defaultConstraints,
	controls = defaultControls,
	sound = false,
	closeWhenDocumentHidden = true,
	title = "Сканирование штрихкода",
	hint = "Расположите штрихкод внутри рамки",
	retryLabel = "Повторить",
	errorMessages,
	className
}: BarcodeScannerDialogProps) {
	const scannerRef = useRef<IScannerHandle>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const handledRef = useRef(false);
	const [error, setError] = useState<BarcodeScannerError | null>(null);

	const stopCamera = useCallback(() => {
		stopMediaStream(scannerRef.current?.getStream() ?? streamRef.current);
		streamRef.current = null;
	}, []);

	const closeScanner = useCallback(() => {
		stopCamera();
		onClose();
	}, [onClose, stopCamera]);

	useEffect(() => {
		if (error) return;

		let frameId = 0;
		const rememberStream = () => {
			const stream = scannerRef.current?.getStream();
			if (stream) {
				streamRef.current = stream;
				return;
			}

			frameId = window.requestAnimationFrame(rememberStream);
		};

		frameId = window.requestAnimationFrame(rememberStream);

		return () => {
			window.cancelAnimationFrame(frameId);
			stopMediaStream(streamRef.current);
			streamRef.current = null;
		};
	}, [error]);

	useEffect(() => {
		if (!closeWhenDocumentHidden) return;

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") closeScanner();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [closeScanner, closeWhenDocumentHidden]);

	const handleScan = useCallback(
		(detectedCodes: IDetectedBarcode[]) => {
			const detectedCode = detectedCodes[0];
			if (!detectedCode || handledRef.current) return;

			handledRef.current = true;
			stopCamera();
			onDetected({ value: detectedCode.rawValue, format: detectedCode.format });
			onClose();
		},
		[onClose, onDetected, stopCamera]
	);

	const handleError = useCallback(
		(scannerError: IScannerError) => {
			stopCamera();
			setError(scannerError);
			onError?.(scannerError);
		},
		[onError, stopCamera]
	);

	function retryScanning() {
		handledRef.current = false;
		setError(null);
	}

	const rootClassName = className ? `${styles.root} ${className}` : styles.root;
	const visibleErrorMessage = error ? (errorMessages?.[error.kind] ?? defaultErrorMessages[error.kind]) : null;

	return (
		<Modal isOpen onClose={closeScanner} size="xl" title={title}>
			<ModalContent>
				<section className={rootClassName} aria-label={title}>
					<div className={styles.viewport}>
						{error ? (
							<div className={styles.error}>
								<p role="alert">{visibleErrorMessage}</p>
								<Button type="button" variant="infoOutline" onClick={retryScanning}>
									{retryLabel}
								</Button>
							</div>
						) : (
							<Scanner
								ref={scannerRef}
								formats={[...formats]}
								constraints={constraints}
								allowMultiple={false}
								sound={sound}
								components={controls}
								classNames={{ container: styles.scanner, video: styles.video }}
								onScan={handleScan}
								onError={handleError}
							/>
						)}
					</div>
					{!error && hint ? <p className={styles.hint}>{hint}</p> : null}
				</section>
			</ModalContent>
		</Modal>
	);
}
