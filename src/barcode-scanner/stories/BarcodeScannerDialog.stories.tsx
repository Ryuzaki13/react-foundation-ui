import { useState } from "react";

import { Button } from "../../button";
import { BarcodeScannerDialog, type BarcodeScanResult, type BarcodeScannerDialogProps } from "../BarcodeScannerDialog";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/BarcodeScannerDialog",
	component: BarcodeScannerDialog,
	parameters: {
		layout: "centered"
	}
} satisfies Meta<BarcodeScannerDialogProps>;

export default meta;
type Story = StoryObj<BarcodeScannerDialogProps>;

export const Basic: Story = {
	render: function Render() {
		const [opened, setOpened] = useState(false);
		const [result, setResult] = useState<BarcodeScanResult | null>(null);

		return (
			<div style={{ display: "grid", gap: "var(--space-md)", justifyItems: "start" }}>
				<Button type="button" variant="infoOutline" onClick={() => setOpened(true)}>
					Открыть сканер
				</Button>
				{result ? (
					<p style={{ margin: 0 }}>
						Результат: {result.value} ({result.format})
					</p>
				) : null}
				{opened ? (
					<BarcodeScannerDialog
						onDetected={setResult}
						onClose={() => setOpened(false)}
						formats={["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"]}
					/>
				) : null}
			</div>
		);
	}
};
