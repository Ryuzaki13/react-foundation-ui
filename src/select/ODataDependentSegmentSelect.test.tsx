// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const oDataSelectSpy = vi.fn();

vi.mock("./ODataSelect", () => {
	function MockODataSelect(props: { value?: string; disabled?: boolean; onChange: (value: string | undefined) => void }) {
		oDataSelectSpy(props);

		return (
			<div>
				<button type="button" data-testid="select-value" disabled={props.disabled} onClick={() => props.onChange("B0102")}>
					Выбрать
				</button>
				<button type="button" data-testid="clear-value" disabled={props.disabled} onClick={() => props.onChange(undefined)}>
					Очистить
				</button>
			</div>
		);
	}

	const moduleExports = {} as { ODataSelect: typeof MockODataSelect };
	moduleExports.ODataSelect = MockODataSelect;

	return moduleExports;
});

import { ODataDependentSegmentSelect } from "./ODataDependentSegmentSelect";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const branchItem = {
	id: "BRANCH",
	serviceKey: "S1.T1",
	serviceIndex: 0,
	segmentIndex: 1,
	odata: { service: "S1", target: "T1" },
	segment: { placeholder: "Подразделение", hideCode: true as const },
	model: { codeKey: "BRANCH" },
	panelVisibility: "user" as const
};

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
	oDataSelectSpy.mockReset();

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

describe("ODataDependentSegmentSelect", () => {
	it("адаптирует массивный снимок сегмента к одному значению ODataSelect", async () => {
		await renderNode(
			<ODataDependentSegmentSelect
				item={branchItem}
				values={{ REGION: ["R01"], BRANCH: ["B0101"] }}
				label="Подразделение"
				clearable
			/>
		);

		expect(oDataSelectSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				segment: expect.objectContaining({ hideCode: true }),
				dependencies: { REGION: ["R01"], BRANCH: ["B0101"] },
				value: "B0101",
				label: "Подразделение",
				clearable: true,
				disabled: false
			})
		);
	});

	it("публикует single-value как массив и сбрасывает downstream sequential-уровни", async () => {
		const onChange = vi.fn();

		await renderNode(
			<ODataDependentSegmentSelect
				item={branchItem}
				values={{ REGION: ["R01"], BRANCH: ["B0101"], TEAM: ["T0101"], UNRELATED: ["U01"] }}
				onChange={onChange}
				selectionMode="sequential"
				segmentOrder={["REGION", "BRANCH", "TEAM"]}
			/>
		);

		const selectButton = container?.querySelector('[data-testid="select-value"]') as HTMLButtonElement;

		await act(async () => {
			selectButton.click();
		});

		expect(onChange).toHaveBeenCalledWith({
			REGION: ["R01"],
			BRANCH: ["B0102"],
			TEAM: [],
			UNRELATED: ["U01"]
		});
	});

	it("блокирует sequential-сегмент при незаполненном предыдущем пути", async () => {
		const onChange = vi.fn();

		await renderNode(
			<ODataDependentSegmentSelect
				item={branchItem}
				values={{ REGION: [] }}
				onChange={onChange}
				selectionMode="sequential"
				segmentOrder={["REGION", "BRANCH", "TEAM"]}
			/>
		);

		expect(oDataSelectSpy).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
		expect((container?.querySelector('[data-testid="select-value"]') as HTMLButtonElement).disabled).toBe(true);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("сохраняет single-value во внутреннем снимке uncontrolled-компонента", async () => {
		await renderNode(<ODataDependentSegmentSelect item={branchItem} />);

		const selectButton = container?.querySelector('[data-testid="select-value"]') as HTMLButtonElement;

		await act(async () => {
			selectButton.click();
		});

		expect(oDataSelectSpy).toHaveBeenLastCalledWith(expect.objectContaining({ value: "B0102" }));
	});
});
