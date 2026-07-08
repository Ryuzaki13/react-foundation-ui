// @vitest-environment jsdom

import React, { act, useState } from "react";

import { fireEvent } from "@testing-library/dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ExpandableActionPanel } from "./ExpandableActionPanel";
import { LabeledExpandableActionPanel } from "./LabeledExpandableActionPanel";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

window.requestAnimationFrame ??= (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0);
window.cancelAnimationFrame ??= (handle: number) => window.clearTimeout(handle);

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

function getToggleButton() {
	return container?.querySelector<HTMLButtonElement>('[data-ui="expandable-action-panel-toggle"]') ?? null;
}

afterEach(async () => {
	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = null;
	}

	container?.remove();
	container = null;
	document.body.innerHTML = "";
	vi.clearAllMocks();
});

describe("ExpandableActionPanel", () => {
	it("раскрывает контент и обновляет aria-expanded", async () => {
		const onOpenChange = vi.fn();

		await renderNode(
			<ExpandableActionPanel onOpenChange={onOpenChange}>
				<button type="button">Действие</button>
			</ExpandableActionPanel>
		);

		const toggle = getToggleButton();
		expect(toggle).not.toBeNull();
		expect(toggle?.getAttribute("aria-expanded")).toBe("false");
		expect(container?.querySelector('[role="group"]')).toBeNull();

		await act(async () => {
			fireEvent.click(toggle as HTMLButtonElement);
		});

		expect(onOpenChange).toHaveBeenCalledWith(true);
		expect(toggle?.getAttribute("aria-expanded")).toBe("true");
		expect(container?.querySelector('[role="group"]')?.textContent).toContain("Действие");
	});

	it("поддерживает controlled-режим", async () => {
		const onOpenChange = vi.fn();

		function ControlledPanel() {
			const [open, setOpen] = useState(false);

			return (
				<ExpandableActionPanel
					open={open}
					onOpenChange={(nextOpen) => {
						onOpenChange(nextOpen);
						setOpen(nextOpen);
					}}>
					<button type="button">Действие</button>
				</ExpandableActionPanel>
			);
		}

		await renderNode(<ControlledPanel />);

		const toggle = getToggleButton();

		await act(async () => {
			fireEvent.click(toggle as HTMLButtonElement);
		});

		expect(onOpenChange).toHaveBeenCalledWith(true);
		expect(toggle?.getAttribute("aria-expanded")).toBe("true");
	});
});

describe("LabeledExpandableActionPanel", () => {
	it("рендерит левый flexEllipsis-текст с настраиваемой минимальной шириной", async () => {
		await renderNode(
			<LabeledExpandableActionPanel label="Название строки" labelMinWidth="18em">
				<button type="button">Действие</button>
			</LabeledExpandableActionPanel>
		);

		const label = container?.querySelector('[data-ui="labeled-expandable-action-panel"] .flexEllipsis') as HTMLDivElement | null;

		expect(label).not.toBeNull();
		expect(label?.textContent).toBe("Название строки");
		expect(label?.style.minWidth).toBe("18em");
	});
});
