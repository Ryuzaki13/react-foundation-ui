// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { CheckBox } from "./CheckBox";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(async () => {
	if (root) {
		await act(async () => root?.unmount());
	}

	container?.remove();
	container = null;
	root = null;
});

describe("CheckBox", () => {
	it("публикует нативное и доступное mixed-состояние", async () => {
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(<CheckBox value={false} indeterminate onChange={() => undefined} label="Группа" />);
		});

		const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(input.indeterminate).toBe(true);
		expect(input.getAttribute("aria-checked")).toBe("mixed");
	});
});
