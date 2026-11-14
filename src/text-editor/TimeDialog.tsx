import { useState } from "react";

import { Button } from "../button";
import { GridContainer } from "../grid";
import { Input } from "../input";
import { Modal, ModalContent, ModalFooter } from "../modal";
import { RadioGroup } from "../radio-group";
import { UI_APPEARANCE_SOLID, UI_TONE_ACCENT } from "../uiSchemeConstants";

import { isSemanticDateTime } from "./lib/semantic/isSemanticDateTime";
import {
	TIME_DIALOG_MODE_DATE,
	TIME_DIALOG_MODE_TIME,
	TIME_DIALOG_MODE_DATETIME,
	TIME_DIALOG_MODE_RANGE_TIME,
	TIME_DIALOG_MODE_RANGE_DATE,
	TIME_DIALOG_MODE_RANGE_DATETIME
} from "./model/timeDialogModeConstants";
import { type TimeDialogInitialState, type TimeMode } from "./model/timeDialogState";

interface TimeDialogProps {
	onClose: () => void;
	onConfirm: (tagName: string, text: string, attributes: Record<string, string>) => void;
	initialState?: TimeDialogInitialState;
}

/**
 * Диалог настройки временного атрибута или значения в текстовом редакторе.
 */
export function TimeDialog({ onClose, onConfirm, initialState }: TimeDialogProps) {
	const [mode, setMode] = useState<TimeMode | undefined>(() => initialState?.mode ?? TIME_DIALOG_MODE_DATE);
	const [from, setFrom] = useState(() => initialState?.from ?? "");
	const [to, setTo] = useState(() => initialState?.to ?? "");
	const [errors, setErrors] = useState<{ from?: string; to?: string }>({});

	const validate = () => {
		const newErrors: typeof errors = {};
		// const isValid = true;

		const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
		const isTime = (v: string) => /^\d{2}:\d{2}$/.test(v);
		const isDateTime = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);

		const check = (
			label: string,
			value: string,
			type: typeof TIME_DIALOG_MODE_DATE | typeof TIME_DIALOG_MODE_TIME | typeof TIME_DIALOG_MODE_DATETIME
		) => {
			if (!value) return `${label} обязательно`;
			if (type === TIME_DIALOG_MODE_DATE && !isDate(value)) return "Неверный формат даты (ГГГГ-ММ-ДД)";
			if (type === TIME_DIALOG_MODE_TIME && !isTime(value)) return "Неверный формат времени (ЧЧ:ММ)";
			if (type === TIME_DIALOG_MODE_DATETIME && !isDateTime(value)) return "Неверный формат даты и времени (ГГГГ-ММ-ДДTЧЧ:ММ)";
			if (!isSemanticDateTime(value)) return "Укажите существующую дату и корректное время";
			return undefined;
		};

		switch (mode) {
			case TIME_DIALOG_MODE_DATE:
				newErrors.from = check("Дата", from, TIME_DIALOG_MODE_DATE);
				break;
			case TIME_DIALOG_MODE_TIME:
				newErrors.from = check("Время", from, TIME_DIALOG_MODE_TIME);
				break;
			case TIME_DIALOG_MODE_DATETIME:
				newErrors.from = check("Дата и время", from, TIME_DIALOG_MODE_DATETIME);
				break;
			case TIME_DIALOG_MODE_RANGE_TIME:
				newErrors.from = check("Время начала", from, TIME_DIALOG_MODE_TIME);
				newErrors.to = check("Время окончания", to, TIME_DIALOG_MODE_TIME);
				break;
			case TIME_DIALOG_MODE_RANGE_DATE:
				newErrors.from = check("Дата начала", from, TIME_DIALOG_MODE_DATE);
				newErrors.to = check("Дата окончания", to, TIME_DIALOG_MODE_DATE);
				break;
			case TIME_DIALOG_MODE_RANGE_DATETIME:
				newErrors.from = check("Начало", from, TIME_DIALOG_MODE_DATETIME);
				newErrors.to = check("Окончание", to, TIME_DIALOG_MODE_DATETIME);
				break;
		}

		setErrors(newErrors);
		return Object.values(newErrors).every((e) => !e);
	};

	const handleConfirm = () => {
		if (!validate()) return;

		// Скрытая правая граница не должна попадать в одиночный режим.
		const datetime = mode?.startsWith("range-") ? `${from}/${to}` : from;
		onConfirm("time", datetime, { datetime });
		onClose();
	};

	const renderInputs = () => {
		switch (mode) {
			case TIME_DIALOG_MODE_DATE:
			case TIME_DIALOG_MODE_DATETIME:
			case TIME_DIALOG_MODE_TIME:
				return (
					<Input
						label="Значение"
						placeholder={
							mode === TIME_DIALOG_MODE_TIME ? "09:00" : mode === TIME_DIALOG_MODE_DATE ? "2025-05-18" : "2025-05-18T09:00"
						}
						value={from}
						onChange={setFrom}
						error={errors.from}
					/>
				);
			case TIME_DIALOG_MODE_RANGE_TIME:
			case TIME_DIALOG_MODE_RANGE_DATE:
			case TIME_DIALOG_MODE_RANGE_DATETIME:
				return (
					<>
						<Input
							label="С"
							placeholder={
								mode.includes(TIME_DIALOG_MODE_TIME)
									? "09:00"
									: mode.includes(TIME_DIALOG_MODE_DATE)
										? "2025-05-18"
										: "2025-05-18T09:00"
							}
							value={from}
							onChange={setFrom}
							error={errors.from}
						/>
						<Input
							label="По"
							placeholder={
								mode.includes(TIME_DIALOG_MODE_TIME)
									? "17:00"
									: mode.includes(TIME_DIALOG_MODE_DATE)
										? "2025-05-22"
										: "2025-05-22T17:00"
							}
							value={to}
							onChange={setTo}
							error={errors.to}
						/>
					</>
				);
		}
	};

	return (
		<Modal isOpen={true} onClose={onClose} title="Вставка <time>" size="md">
			<ModalContent>
				<GridContainer gap="md">
					<RadioGroup label="Тип значения" value={mode} onChange={setMode}>
						<RadioGroup.Option label="Дата" value={TIME_DIALOG_MODE_DATE} />
						<RadioGroup.Option label="Дата и время" value={TIME_DIALOG_MODE_DATETIME} />
						<RadioGroup.Option label="Время" value={TIME_DIALOG_MODE_TIME} />
						<RadioGroup.Option label="Диапазон дат" value={TIME_DIALOG_MODE_RANGE_DATE} />
						<RadioGroup.Option label="Диапазон времени" value={TIME_DIALOG_MODE_RANGE_TIME} />
						<RadioGroup.Option label="Диапазон даты и времени" value={TIME_DIALOG_MODE_RANGE_DATETIME} />
					</RadioGroup>

					<GridContainer gap="md">{renderInputs()}</GridContainer>
				</GridContainer>
			</ModalContent>
			<ModalFooter>
				<Button onClick={onClose}>Отмена</Button>
				<Button appearance={UI_APPEARANCE_SOLID} tone={UI_TONE_ACCENT} onClick={handleConfirm}>
					Подтвердить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
