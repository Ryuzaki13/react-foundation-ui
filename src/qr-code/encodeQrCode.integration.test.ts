// @vitest-environment node

import { expect, it, vi } from "vitest";
import { prepareZXingModule as prepareReader, readBarcodes } from "zxing-wasm/reader";
import { prepareZXingModule as prepareWriter, writeBarcode } from "zxing-wasm/writer";

import { encodeQrCode } from "./encodeQrCode";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

it("реальный writer кодирует QR; существующий reader восстанавливает Unicode URL без сети", async () => {
	// Тест использует только опубликованные package subpaths: browser asset delivery проверяет build/Storybook.
	prepareWriter({
		overrides: { wasmBinary: new Uint8Array(readFileSync(require.resolve("zxing-wasm/writer/zxing_writer.wasm"))).buffer }
	});
	prepareReader({
		overrides: { wasmBinary: new Uint8Array(readFileSync(require.resolve("zxing-wasm/reader/zxing_reader.wasm"))).buffer }
	});
	const network = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Неожиданный network запрос"));
	try {
		const payload = "https://example.org/подтверждение#synthetic-only";
		const encoded = await encodeQrCode(payload, "M");
		expect("svg" in encoded && encoded.svg).toContain("<svg");
		const result = await writeBarcode(payload, { format: "QRCode", options: "ecLevel=M", addQuietZones: true, addHRT: false });
		expect(result.error).toBe("");
		if (!result.image) throw new Error("Writer не вернул PNG для независимого roundtrip.");
		const decoded = await readBarcodes(result.image, { formats: ["QRCode"] });
		expect(decoded[0]?.text).toBe(payload);
		expect(network).not.toHaveBeenCalled();
	} finally {
		network.mockRestore();
	}
});
