import { useState } from "react";

import { NullableDateRange } from "@ryuzaki13/react-foundation-lib/formatters";

import { FlexContainer } from "../../../flex";
import { Text } from "../../../text";
import { PresetRangeDateInput } from "../PresetRangeDateInput";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/PresetRangeDateInput",
	component: PresetRangeDateInput,
	args: {
		value: null,
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	}
} satisfies Meta<typeof PresetRangeDateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Демонстрирует совместную работу пресета и ручного диапазона.
 */
export const Default: Story = {
	render: () => {
		const [value, setValue] = useState<NullableDateRange | null>([new Date(2026, 2, 10, 0, 0, 0), new Date(2026, 2, 10, 23, 59, 59)]);
		const [presetId, setPresetId] = useState<string | null>("today");

		return (
			<>
				<FlexContainer gap="sm" align="end">
					<PresetRangeDateInput
						value={value}
						onChange={setValue}
						presetId={presetId}
						onPresetIdChange={setPresetId}
						referenceDate={new Date(2026, 2, 10, 12, 0, 0)}
						presetLabel="Быстрый диапазон"
						size="md"
					/>
				</FlexContainer>

				<Text as="p" className="marginBlockSm">
					Активный presetId: <Text as="code">{presetId ?? "null"}</Text>
				</Text>
			</>
		);
	}
};
