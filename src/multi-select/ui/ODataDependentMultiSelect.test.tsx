// @vitest-environment jsdom

import { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const renderedItems: string[] = [];
vi.mock("./ODataDependentSegmentMultiSelect", () => ({
	["ODataDependentSegmentMultiSelect"]: function mockODataDependentSegmentMultiSelect({
		item,
		values,
		onChange
	}: {
		item: { id: string };
		values?: Record<string, string[]>;
		onChange?: (selected: Record<string, string[]>) => void;
	}) {
		renderedItems.push(item.id);

		return (
			<button
				type="button"
				data-testid={item.id}
				data-values={JSON.stringify(values ?? {})}
				onClick={() =>
					onChange?.({
						...(values ?? {}),
						[item.id]: [item.id]
					})
				}>
				{item.id}
			</button>
		);
	}
}));

import { ODataDependentMultiSelect } from "./ODataDependentMultiSelect";

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
	renderedItems.length = 0;

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

describe("ODataDependentMultiSelect", () => {
	it("рендерит все сегменты через segment-level wrapper", async () => {
		await renderNode(
			<ODataDependentMultiSelect
				odata={{ service: "S1", target: "T1" }}
				segments={{
					ZDIV: { placeholder: "Дивизион" },
					ZCFO1: { placeholder: "Филиал" }
				}}
			/>
		);

		expect(renderedItems).toEqual(["ZDIV", "ZCFO1"]);
	});

	it("сохраняет общий uncontrolled state между сегментами", async () => {
		const onChange = vi.fn();

		await renderNode(
			<ODataDependentMultiSelect
				odata={{ service: "S1", target: "T1" }}
				segments={{
					ZDIV: { placeholder: "Дивизион" },
					ZCFO1: { placeholder: "Филиал" }
				}}
				onChange={onChange}
			/>
		);

		const divButton = container?.querySelector('[data-testid="ZDIV"]') as HTMLButtonElement;
		const cfoButton = container?.querySelector('[data-testid="ZCFO1"]') as HTMLButtonElement;

		await act(async () => {
			divButton.click();
		});

		await act(async () => {
			cfoButton.click();
		});

		expect(onChange).toHaveBeenNthCalledWith(1, {
			ZDIV: ["ZDIV"]
		});
		expect(onChange).toHaveBeenNthCalledWith(2, {
			ZDIV: ["ZDIV"],
			ZCFO1: ["ZCFO1"]
		});
	});
});
