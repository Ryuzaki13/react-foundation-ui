import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexCenter } from "../flex";

import styles from "./QrCode.module.scss";
import { QR_CODE_DEFAULT_CORRECTION_LEVEL, QR_CODE_STATUS_ERROR, QR_CODE_STATUS_LOADING } from "./qrCodeConstants";
import { useQrCodeImage } from "./useQrCodeImage";

import type { QrCodeProps } from "./qrCodeTypes";

const DEFAULT_QR_CODE_SIZE_PX = 256;

/** Локальный QR renderer: auth, срок жизни и удаление просроченного value принадлежат host-сценарию. */
export function QrCode({
	value,
	alt,
	size = DEFAULT_QR_CODE_SIZE_PX,
	errorCorrectionLevel = QR_CODE_DEFAULT_CORRECTION_LEVEL,
	className,
	onError
}: QrCodeProps) {
	const image = useQrCodeImage(value, errorCorrectionLevel, onError);
	const resolvedSize = Number.isFinite(size) && size > 0 ? size : DEFAULT_QR_CODE_SIZE_PX;
	return (
		<div
			className={cn(styles.root, className)}
			style={{ width: resolvedSize }}
			data-ui="qr-code"
			data-state={image.status}
			aria-busy={image.status === QR_CODE_STATUS_LOADING}>
			{image.url ? (
				<img
					className={styles.image}
					src={image.url}
					alt={alt}
					width={resolvedSize}
					height={resolvedSize}
					onError={image.onImageError}
				/>
			) : (
				<FlexCenter className={styles.placeholder} role={image.status === QR_CODE_STATUS_ERROR ? "alert" : "status"}>
					{image.status === QR_CODE_STATUS_ERROR ? "Не удалось создать QR-код." : "Формирование QR-кода..."}
				</FlexCenter>
			)}
		</div>
	);
}
