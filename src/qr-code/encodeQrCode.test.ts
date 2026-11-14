import { beforeEach, expect, it, vi } from "vitest";
import { type prepareZXingModule, writeBarcode } from "zxing-wasm/writer";

import { encodeQrCode } from "./encodeQrCode";

const writerSetup = vi.hoisted(() => ({
	options: undefined as Parameters<typeof prepareZXingModule>[0] | undefined
}));

vi.mock("zxing-wasm/writer", () => ({
	prepareZXingModule(options: Parameters<typeof prepareZXingModule>[0]) {
		// Модуль настраивает WASM при импорте, до очистки истории моков.
		writerSetup.options = options;
	},
	writeBarcode: vi.fn()
}));

beforeEach(() => {
	vi.mocked(writeBarcode).mockReset();
});

it("задаёт локальный URL writer WASM вместо CDN", () => {
	const locateFile = writerSetup.options?.overrides?.locateFile;
	expect(locateFile).toBeTypeOf("function");
	const url = locateFile?.("zxing_writer.wasm", "https://cdn.invalid/");
	expect(url).toContain("zxing_writer.wasm");
	expect(url).not.toMatch(/^https?:\/\//u);
});

it("пустое значение отклоняется до vendor API", async () => {
	expect(await encodeQrCode("", "M")).toEqual({ error: { kind: "encoding-failed" } });
	expect(writeBarcode).not.toHaveBeenCalled();
});

it("vendor stdout/stderr не передаются в console", () => {
	const overrides = writerSetup.options?.overrides;
	const log = vi.spyOn(console, "log");
	const error = vi.spyOn(console, "error");
	try {
		expect(overrides?.print).toBeTypeOf("function");
		expect(overrides?.printErr).toBeTypeOf("function");
		overrides?.print?.("synthetic-secret");
		overrides?.printErr?.("synthetic-secret");
		expect(log).not.toHaveBeenCalled();
		expect(error).not.toHaveBeenCalled();
	} finally {
		log.mockRestore();
		error.mockRestore();
	}
});

it("vendor exception не раскрывает payload или cause", async () => {
	vi.mocked(writeBarcode).mockRejectedValue(new Error("secret payload"));
	expect(await encodeQrCode("secret payload", "M")).toEqual({ error: { kind: "unavailable" } });
});

it("vendor error нормализуется, quiet zone и коррекция передаются явно", async () => {
	vi.mocked(writeBarcode).mockResolvedValue({
		error: "secret payload too long",
		svg: "",
		utf8: "",
		image: null,
		symbol: { width: 0, height: 0, data: new Uint8ClampedArray() }
	});
	expect(await encodeQrCode("secret payload", "H")).toEqual({ error: { kind: "encoding-failed" } });
	expect(writeBarcode).toHaveBeenCalledExactlyOnceWith("secret payload", {
		format: "QRCode",
		options: "ecLevel=H",
		addQuietZones: true,
		addHRT: false,
		invert: false
	});
});
