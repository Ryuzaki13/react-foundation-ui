// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const oDataMultiSelectSpy = vi.fn();

vi.mock("./ODataMultiSelect", () => ({
	ODataMultiSelect: function MockODataMultiSelect(props: Record<string, unknown>) {
		oDataMultiSelectSpy(props);
		return <div data-testid="odata-multi-select" />;
	}
}));

import { ODataDependentSegmentMultiSelect } from "./ODataDependentSegmentMultiSelect";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderNode(node: React.ReactNode) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root!.render(node);
	});
}

afterEach(async () => {
	oDataMultiSelectSpy.mockReset();

	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = null;
	}

	container?.remove();
	container = null;
	document.body.innerHTML = "";
});

describe("ODataDependentSegmentMultiSelect", () => {
	it("пробрасывает hideCode сегмента в ODataMultiSelect без потери", async () => {
		await renderNode(
			<ODataDependentSegmentMultiSelect
				item={{
					id: "ZDIV",
					serviceKey: "S1.T1",
					serviceIndex: 0,
					segmentIndex: 0,
					odata: { service: "S1", target: "T1" },
					segment: { placeholder: "Дивизион", hideCode: true },
					model: { codeKey: "ZDIV" },
					panelVisibility: "user"
				}}
				values={{ ZDIV: ["1000"] }}
			/>
		);

		expect(oDataMultiSelectSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				segment: expect.objectContaining({
					placeholder: "Дивизион",
					hideCode: true
				}),
				value: ["1000"]
			})
		);
	});
});
