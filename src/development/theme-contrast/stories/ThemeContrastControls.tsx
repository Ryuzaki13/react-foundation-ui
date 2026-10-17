import { useState } from "react";

import { Button } from "../../../button";
import { CheckBox } from "../../../check-box";
import { FlexContainer } from "../../../flex";
import { GridContainer } from "../../../grid";
import { InputText } from "../../../input";

import styles from "./ThemeContrast.module.scss";

/** Реальные компоненты проверяют наследование рассчитанных токенов и доступность состояний. */
export function ThemeContrastControls() {
	const [text, setText] = useState("");
	const [invalidText, setInvalidText] = useState("Пример значения");
	const [selected, setSelected] = useState(true);
	const [activationCount, setActivationCount] = useState(0);

	return (
		<GridContainer gap="md" className={styles.surface}>
			<InputText
				label="Редактируемое поле"
				description="Проверьте подпись, placeholder и границу поля."
				placeholder="Введите текст"
				value={text}
				onChange={setText}
				data-contrast-input="editable"
			/>
			<div className={styles.errorField}>
				<InputText label="Поле с ошибкой" error="Проверьте введённое значение" value={invalidText} onChange={setInvalidText} />
			</div>
			<CheckBox
				label="Выбранный элемент"
				description="Снимите выбор, чтобы сравнить границы обоих состояний."
				value={selected}
				onChange={setSelected}
				data-contrast-checkbox="selection"
			/>
			<FlexContainer wrap gap="sm">
				<Button
					tone="accent"
					appearance="solid"
					onClick={() => setActivationCount((count) => count + 1)}
					data-contrast-button="accent">
					Акцентная кнопка
				</Button>
				<Button tone="neutral" appearance="outline">
					Нейтральная
				</Button>
				<Button tone="error" appearance="outline">
					Ошибка
				</Button>
				<Button tone="success" appearance="solid" data-contrast-button="success">
					Успех
				</Button>
				<Button tone="neutral" appearance="outline" disabled>
					Недоступная команда
				</Button>
			</FlexContainer>
			<div className={styles.focusClip}>
				<Button tone="accent" appearance="solid" data-contrast-button="clipped" className={styles.clippedButton}>
					Фокус внутри обрезающего контейнера
				</Button>
			</div>
			<output className={styles.secondary} data-contrast-output="activation">
				Нажатий: {activationCount}
			</output>
		</GridContainer>
	);
}
