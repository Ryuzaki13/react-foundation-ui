import { useEffect, useEffectEvent, useMemo, useState } from "react";

import { encodeQrCode } from "./encodeQrCode";
import { QR_CODE_ERROR_UNAVAILABLE, QR_CODE_STATUS_ERROR, QR_CODE_STATUS_LOADING, QR_CODE_STATUS_READY } from "./qrCodeConstants";

import type { QrCodeError, QrCodeProps } from "./qrCodeTypes";

type QrCodeRequest = Readonly<{ value: string; level: NonNullable<QrCodeProps["errorCorrectionLevel"]> }>;
type QrCodeImage =
	| { readonly request: QrCodeRequest; readonly status: typeof QR_CODE_STATUS_READY; readonly url: string }
	| { readonly request: QrCodeRequest; readonly status: typeof QR_CODE_STATUS_ERROR; readonly error: QrCodeError };

/** Ресурс принадлежит одной генерации изображения, а не всему lifetime компонента. */
export function useQrCodeImage(value: string, level: QrCodeRequest["level"], onError: QrCodeProps["onError"]) {
	const request = useMemo(() => ({ value, level }), [value, level]);
	const [image, setImage] = useState<QrCodeImage | null>(null);
	const reportEncodingError = useEffectEvent((error: QrCodeError) => onError?.(error));

	useEffect(() => {
		let active = true;
		let objectUrl: string | undefined;
		void encodeQrCode(request.value, request.level).then((result) => {
			if (!active) return;
			let error: QrCodeError | undefined;
			if ("error" in result) error = result.error;
			else {
				try {
					objectUrl = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));
					setImage({ request, status: QR_CODE_STATUS_READY, url: objectUrl });
					return;
				} catch {
					error = { kind: QR_CODE_ERROR_UNAVAILABLE };
				}
			}
			setImage({ request, status: QR_CODE_STATUS_ERROR, error });
			reportEncodingError(error);
		});
		return () => {
			active = false;
			if (objectUrl !== undefined) URL.revokeObjectURL(objectUrl);
		};
	}, [request]);

	// Сравнивается identity запроса: A → B → A не возвращает уже отозванный URL первого A.
	// Старый QR исчезает на первом render новых props, до выполнения cleanup/effect.
	const current = image?.request === request ? image : null;
	return {
		status: current?.status ?? QR_CODE_STATUS_LOADING,
		url: current?.status === QR_CODE_STATUS_READY ? current.url : undefined,
		onImageError: () => {
			if (current?.status !== QR_CODE_STATUS_READY) return;
			const error: QrCodeError = { kind: QR_CODE_ERROR_UNAVAILABLE };
			setImage({ request, status: QR_CODE_STATUS_ERROR, error });
			onError?.(error);
		}
	};
}
