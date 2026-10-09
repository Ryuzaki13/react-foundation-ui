// @vitest-environment node

import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";

it("server import/render не запускает WASM, Blob URL или network и не сериализует value", async () => {
	const network = vi.spyOn(globalThis, "fetch");
	const createObjectURL = vi.spyOn(URL, "createObjectURL");
	try {
		// Проверяется и импорт модуля: eager WASM загрузка не должна скрыться до spy setup.
		const { QrCode } = await import("./QrCode");
		const html = renderToString(<QrCode value="synthetic-secret" alt="Назначение кода" />);
		expect(html).toContain('data-state="loading"');
		expect(html).not.toContain("synthetic-secret");
		expect(html).not.toContain("blob:");
		expect(network).not.toHaveBeenCalled();
		expect(createObjectURL).not.toHaveBeenCalled();
	} finally {
		network.mockRestore();
		createObjectURL.mockRestore();
	}
});
