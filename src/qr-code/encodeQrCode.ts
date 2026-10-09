import { prepareZXingModule, writeBarcode } from "zxing-wasm/writer";
import zxingWriterWasmUrl from "zxing-wasm/writer/zxing_writer.wasm?url";

import type { QrCodeError, QrCodeProps } from "./qrCodeTypes";

// Как у barcode-scanner, WASM доставляет host-сборщик из установленного npm-пакета.
// Настройка не загружает бинарник: SSR безопасен, первая генерация запускается после mount.
prepareZXingModule({
	overrides: {
		locateFile: (path: string, prefix: string) => (path.endsWith(".wasm") ? zxingWriterWasmUrl : `${prefix}${path}`),
		// Emscripten по умолчанию пишет abort/cause в console; наружу допускается только QrCodeError.kind.
		print: () => undefined,
		printErr: () => undefined
	}
});

type EncodedQrCode = { readonly svg: string } | { readonly error: QrCodeError };

/** Приватная граница изолирует экспериментальные ZXing types и сообщения от стабильного UI API. */
export async function encodeQrCode(
	value: string,
	errorCorrectionLevel: NonNullable<QrCodeProps["errorCorrectionLevel"]>
): Promise<EncodedQrCode> {
	if (value.length === 0) return { error: { kind: "encoding-failed" } };
	try {
		const result = await writeBarcode(value, {
			format: "QRCode",
			options: `ecLevel=${errorCorrectionLevel}`,
			addQuietZones: true,
			addHRT: false,
			invert: false
		});
		if (result.error || !result.svg) return { error: { kind: "encoding-failed" } };
		return { svg: result.svg };
	} catch {
		return { error: { kind: "unavailable" } };
	}
}
