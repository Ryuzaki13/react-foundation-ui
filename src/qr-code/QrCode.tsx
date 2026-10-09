import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexCenter } from "../flex";

import styles from "./QrCode.module.scss";
import { useQrCodeImage } from "./useQrCodeImage";

import type { QrCodeProps } from "./qrCodeTypes";

/** Локальный QR renderer: auth, срок жизни и удаление просроченного value принадлежат host-сценарию. */
export function QrCode({ value, alt, size = 256, errorCorrectionLevel = "M", className, onError }: QrCodeProps) {
	const image = useQrCodeImage(value, errorCorrectionLevel, onError);
	const resolvedSize = Number.isFinite(size) && size > 0 ? size : 256;
	return (
		<div
			className={cn(styles.root, className)}
			style={{ width: resolvedSize }}
			data-ui="qr-code"
			data-state={image.status}
			aria-busy={image.status === "loading"}>
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
				<FlexCenter className={styles.placeholder} role={image.status === "error" ? "alert" : "status"}>
					{image.status === "error" ? "Не удалось создать QR-код." : "Формирование QR-кода..."}
				</FlexCenter>
			)}
		</div>
	);
}
