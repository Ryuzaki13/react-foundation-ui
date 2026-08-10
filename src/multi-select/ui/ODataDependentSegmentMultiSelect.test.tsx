// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const oDataMultiSelectSpy = vi.fn();

vi.mock("./ODataMultiSelect", () => {
	function MockODataMultiSelect(props: Record<string, unknown>) {
		oDataMultiSelectSpy(props);
		return <div data-testid="odata-multi-select" />;
	}

	const moduleExports = {} as { ODataMultiSelect: typeof MockODataMultiSelect };
	moduleExports.ODataMultiSelect = MockODataMultiSelect;

	return moduleExports;
});

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

	it("использует общий sequential-policy и сбрасывает последующие уровни", async () => {
		const onChange = vi.fn();

		await renderNode(
			<ODataDependentSegmentMultiSelect
				item={{
					id: "ZCFO1",
					serviceKey: "S1.T1",
					serviceIndex: 0,
					segmentIndex: 1,
					odata: { service: "S1", target: "T1" },
					segment: { placeholder: "Филиал" },
					model: { codeKey: "ZCFO1" },
					panelVisibility: "user"
				}}
				values={{ ZDIV: ["1000"], ZCFO1: ["0202"], VSTEL: ["1158"], OTHER: ["X"] }}
				onChange={onChange}
				selectionMode="sequential"
				segmentOrder={["ZDIV", "ZCFO1", "VSTEL"]}
			/>
		);

		const renderedProps = oDataMultiSelectSpy.mock.calls.at(-1)?.[0] as {
			disabled?: boolean;
			onChange: (values: string[]) => void;
		};

		expect(renderedProps.disabled).toBe(false);

		await act(async () => {
			renderedProps.onChange(["0204"]);
		});

		expect(onChange).toHaveBeenCalledWith({
			ZDIV: ["1000"],
			ZCFO1: ["0204"],
			VSTEL: [],
			OTHER: ["X"]
		});
	});

	it("блокирует сегмент, пока не заполнен предыдущий sequential-уровень", async () => {
		await renderNode(
			<ODataDependentSegmentMultiSelect
				item={{
					id: "ZCFO1",
					serviceKey: "S1.T1",
					serviceIndex: 0,
					segmentIndex: 1,
					odata: { service: "S1", target: "T1" },
					segment: { placeholder: "Филиал" },
					model: { codeKey: "ZCFO1" },
					panelVisibility: "user"
				}}
				values={{ ZDIV: [] }}
				selectionMode="sequential"
				segmentOrder={["ZDIV", "ZCFO1"]}
			/>
		);

		expect(oDataMultiSelectSpy).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
	});
});
