import { WheelPicker } from "../../wheel-picker";
import { buildTimePanelState } from "../lib/timePanelState";

import styles from "./TimePanel.module.scss";

import type { DateTimeInputMode } from "../lib";

/**
 * Пропсы панели выбора времени.
 */
export interface TimePanelProps {
	value: Date;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	mode?: DateTimeInputMode;
	onChange: (hours: number, minutes: number) => void;
}

/**
 * Переиспользуемая панель выбора времени поверх internal wheel-picker.
 */
export function TimePanel({ value, disabled, minDate, maxDate, mode = "date-time", onChange }: TimePanelProps) {
	const state = buildTimePanelState(value, minDate, maxDate, mode);

	/**
	 * Форматирует двузначное значение времени.
	 */
	const formatValue = (timePart: number) => String(timePart).padStart(2, "0");

	if (state.disabled) {
		return (
			<div className={styles.timePanel}>
				<p className={styles.hint}>Для выбранного дня нет доступного времени в заданном диапазоне.</p>
			</div>
		);
	}

	return (
		<div className={styles.timePanel}>
			<div className={styles.fields}>
				<label className={styles.field}>
					<span className={styles.label}>Часы</span>
					<WheelPicker
						className={styles.wheel}
						items={state.hours}
						value={state.selectedHour}
						onChange={(hours) => onChange(hours, state.selectedMinute)}
						ariaLabel="Выбор часов"
						disabled={disabled}
						formatItem={formatValue}
					/>
				</label>

				<label className={styles.field}>
					<span className={styles.label}>Минуты</span>
					<WheelPicker
						className={styles.wheel}
						items={state.minutes}
						value={state.selectedMinute}
						onChange={(minutes) => onChange(state.selectedHour, minutes)}
						ariaLabel="Выбор минут"
						disabled={disabled}
						formatItem={formatValue}
					/>
				</label>
			</div>
		</div>
	);
}
