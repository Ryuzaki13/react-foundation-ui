import { useId, useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { CheckBox } from "../../check-box";
import { Section } from "../../panel";
import { RadioButton } from "../../radio-button";

import styles from "./ComponentGallery.module.scss";

const meta = {
	title: "Development/3. Флажки и радиокнопки",
	parameters: {
		atomicCanvas: true,
		layout: "fullscreen",
		docs: {
			description: {
				component: "Совместная витрина флажков и радиокнопок для сравнения выбранных, частично выбранных и недоступных состояний."
			}
		}
	}
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
	render: function ChoiceControls() {
		const radioGroupId = useId();
		// Независимые состояния позволяют проверять каждый образец, не меняя соседние варианты в витрине.
		const [checked, setChecked] = useState(true);
		const [unchecked, setUnchecked] = useState(false);
		const [disabledChecked, setDisabledChecked] = useState(true);
		const [disabledUnchecked, setDisabledUnchecked] = useState(false);
		const [partiallyChecked, setPartiallyChecked] = useState(false);
		const [indeterminate, setIndeterminate] = useState(true);
		const [radioValue, setRadioValue] = useState("first");
		const [disabledRadioValue, setDisabledRadioValue] = useState("first");

		return (
			<div className={styles.gallery}>
				<Section title="check-box" className={styles.section}>
					<div className={styles.stack}>
						<CheckBox label="Выбранный флажок" value={checked} onChange={setChecked} />
						<CheckBox label="Невыбранный флажок" value={unchecked} onChange={setUnchecked} />
						<CheckBox
							label="Частично выбранная группа"
							description="Нажатие переводит группу из частичного состояния в обычный выбор."
							value={partiallyChecked}
							indeterminate={indeterminate}
							onChange={(value) => {
								setPartiallyChecked(value);
								setIndeterminate(false);
							}}
						/>
						<CheckBox label="Недоступный выбранный" value={disabledChecked} onChange={setDisabledChecked} disabled />
						<CheckBox label="Недоступный невыбранный" value={disabledUnchecked} onChange={setDisabledUnchecked} disabled />
					</div>
				</Section>
				<Section title="radio-button" className={styles.section}>
					<div role="radiogroup" aria-label="Доступные варианты" className={styles.stack}>
						<RadioButton
							name={radioGroupId}
							label="Первый вариант"
							value={radioValue === "first"}
							onChange={(value) => {
								if (value) setRadioValue("first");
							}}
						/>
						<RadioButton
							name={radioGroupId}
							label="Второй вариант"
							value={radioValue === "second"}
							onChange={(value) => {
								if (value) setRadioValue("second");
							}}
						/>
					</div>
					<div role="radiogroup" aria-label="Недоступные варианты" className={styles.stack}>
						<RadioButton
							name={`${radioGroupId}-disabled`}
							label="Недоступный выбранный"
							value={disabledRadioValue === "first"}
							onChange={(value) => {
								if (value) setDisabledRadioValue("first");
							}}
							disabled
						/>
						<RadioButton
							name={`${radioGroupId}-disabled`}
							label="Недоступный невыбранный"
							value={disabledRadioValue === "second"}
							onChange={(value) => {
								if (value) setDisabledRadioValue("second");
							}}
							disabled
						/>
					</div>
				</Section>
			</div>
		);
	}
};
