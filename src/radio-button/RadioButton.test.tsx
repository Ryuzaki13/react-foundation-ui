// @vitest-environment jsdom

import { act, useState } from "react";

import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RadioButton } from "./RadioButton";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type RadioValue = "email" | "sms";

type RadioPairProps = {
	onSelectionChange: (value: RadioValue, checked: boolean) => void;
};

/** Монтирует controlled-группу и сохраняет булевый API каждого RadioButton. */
function RadioPair({ onSelectionChange }: RadioPairProps) {
	const [selected, setSelected] = useState<RadioValue | null>("email");
	const handleChange = (value: RadioValue, checked: boolean) => {
		onSelectionChange(value, checked);
		setSelected(checked ? value : null);
	};

	return (
		<>
			<RadioButton
				name="notification-channel"
				label="Email"
				value={selected === "email"}
				onChange={(checked) => handleChange("email", checked)}
			/>
			<RadioButton
				name="notification-channel"
				label="SMS"
				value={selected === "sms"}
				onChange={(checked) => handleChange("sms", checked)}
			/>
		</>
	);
}

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

describe("RadioButton", () => {
	it("использует native radio-группу, переключает выбор и не снимает его повторным кликом", async () => {
		const onSelectionChange = vi.fn<RadioPairProps["onSelectionChange"]>();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);

		await act(async () => {
			root?.render(<RadioPair onSelectionChange={onSelectionChange} />);
		});

		const radioInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="notification-channel"]'));
		const [emailRadio, smsRadio] = radioInputs;

		expect(radioInputs).toHaveLength(2);
		expect(radioInputs.every((input) => input.type === "radio")).toBe(true);
		expect(emailRadio?.checked).toBe(true);
		expect(smsRadio?.checked).toBe(false);

		await act(async () => {
			smsRadio?.click();
		});

		expect(emailRadio?.checked).toBe(false);
		expect(smsRadio?.checked).toBe(true);
		expect(onSelectionChange).toHaveBeenCalledTimes(1);
		expect(onSelectionChange).toHaveBeenLastCalledWith("sms", true);

		await act(async () => {
			smsRadio?.click();
		});

		expect(smsRadio?.checked).toBe(true);
		expect(onSelectionChange).toHaveBeenCalledTimes(1);
	});
});
