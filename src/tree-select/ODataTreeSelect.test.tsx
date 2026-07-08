/* eslint-disable @typescript-eslint/naming-convention */
// @vitest-environment jsdom

import React, { act } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const recordedProps = {
	treeSelect: null as Record<string, unknown> | null,
	treeMultiSelect: null as Record<string, unknown> | null
};

vi.mock("./model/useODataTreeData", () => ({
	useODataTreeData: vi.fn()
}));

vi.mock("./TreeSelect", () => ({
	TreeSelect: function MockTreeSelect(props: Record<string, unknown>) {
		recordedProps.treeSelect = props;
		return <div data-testid="tree-select" />;
	}
}));

vi.mock("./TreeMultiSelect", () => ({
	TreeMultiSelect: function MockTreeMultiSelect(props: Record<string, unknown>) {
		recordedProps.treeMultiSelect = props;
		return <div data-testid="tree-multi-select" />;
	}
}));

import { useODataTreeData } from "./model/useODataTreeData";
import { ODataTreeMultiSelect } from "./ODataTreeMultiSelect";
import { ODataTreeSelect } from "./ODataTreeSelect";

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
	recordedProps.treeSelect = null;
	recordedProps.treeMultiSelect = null;
	vi.clearAllMocks();

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

describe("ODataTree wrappers", () => {
	it("пробрасывает данные и loading/error в TreeSelect", async () => {
		vi.mocked(useODataTreeData).mockReturnValue({
			nodes: [{ id: "A:1", codeKey: "A", value: "1", label: "One", searchText: "1 One" }],
			orderedSegmentItems: [],
			orderedCodeKeys: ["A"],
			isLoading: true,
			isError: true,
			placeholder: "Корень",
			hasResolvedChain: true
		});

		await renderNode(
			<ODataTreeSelect
				label="Дерево"
				odata={{ service: "S", target: "T" }}
				segments={{ A: { placeholder: "Корень" } }}
				value={{ codeKey: "A", value: "1" }}
				onChange={vi.fn()}
			/>
		);

		expect(recordedProps.treeSelect).toMatchObject({
			placeholder: "Корень",
			disabled: true,
			isLoading: true,
			error: "Ошибка загрузки",
			value: { codeKey: "A", value: "1" }
		});
	});

	it("пробрасывает данные и loading/error в TreeMultiSelect", async () => {
		vi.mocked(useODataTreeData).mockReturnValue({
			nodes: [{ id: "A:1", codeKey: "A", value: "1", label: "One", searchText: "1 One" }],
			orderedSegmentItems: [],
			orderedCodeKeys: ["A"],
			isLoading: false,
			isError: false,
			placeholder: "Корень",
			hasResolvedChain: false
		});

		await renderNode(
			<ODataTreeMultiSelect
				label="Дерево"
				odata={{ service: "S", target: "T" }}
				segments={{ A: { placeholder: "Корень", selectText: true } }}
				value={{ A: ["1"] }}
				onChange={vi.fn()}
			/>
		);

		expect(recordedProps.treeMultiSelect).toMatchObject({
			placeholder: "Корень",
			disabled: false,
			isLoading: false,
			error: undefined,
			value: { A: ["1"] }
		});
	});
});
