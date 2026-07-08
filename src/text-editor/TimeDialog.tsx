import { useEffect, useEffectEvent, useState } from "react";

import { Button } from "../button";
import { GridContainer } from "../grid";
import { Input } from "../input";
import { Modal, ModalContent, ModalFooter } from "../modal";
import { RadioGroup } from "../radio-group";

type TimeDialogInitialState = {
	mode?: TimeMode;
	from?: string;
	to?: string;
};

interface TimeDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (tagName: string, text: string, attributes: Record<string, string>) => void;
	initialState?: TimeDialogInitialState;
}

type TimeMode = "date" | "datetime" | "time" | "range-time" | "range-date" | "range-datetime";

/**
 * Диалог настройки временного атрибута или значения в текстовом редакторе.
 */
export function TimeDialog({ isOpen, onClose, onConfirm, initialState }: TimeDialogProps) {
	const [mode, setMode] = useState<TimeMode | undefined>("date");
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [errors, setErrors] = useState<{ from?: string; to?: string }>({});

	const syncInitialState = useEffectEvent((initialState?: TimeDialogInitialState) => {
		setMode(initialState?.mode ?? "date");
		setFrom(initialState?.from ?? "");
		setTo(initialState?.to ?? "");
		setErrors({});
	});

	useEffect(() => {
		if (isOpen) {
			syncInitialState(initialState);
		}
	}, [isOpen, initialState]);

	const validate = () => {
		const newErrors: typeof errors = {};
		// const isValid = true;

		const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
		const isTime = (v: string) => /^\d{2}:\d{2}$/.test(v);
		const isDateTime = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);

		const check = (label: string, value: string, type: "date" | "time" | "datetime") => {
			if (!value) return `${label} обязательно`;
			if (type === "date" && !isDate(value)) return "Неверный формат даты (ГГГГ-ММ-ДД)";
			if (type === "time" && !isTime(value)) return "Неверный формат времени (ЧЧ:ММ)";
			if (type === "datetime" && !isDateTime(value)) return "Неверный формат даты и времени (ГГГГ-ММ-ДДTЧЧ:ММ)";
			return undefined;
		};

		switch (mode) {
			case "date":
				newErrors.from = check("Дата", from, "date");
				break;
			case "time":
				newErrors.from = check("Время", from, "time");
				break;
			case "datetime":
				newErrors.from = check("Дата и время", from, "datetime");
				break;
			case "range-time":
				newErrors.from = check("Время начала", from, "time");
				newErrors.to = check("Время окончания", to, "time");
				break;
			case "range-date":
				newErrors.from = check("Дата начала", from, "date");
				newErrors.to = check("Дата окончания", to, "date");
				break;
			case "range-datetime":
				newErrors.from = check("Начало", from, "datetime");
				newErrors.to = check("Окончание", to, "datetime");
				break;
		}

		setErrors(newErrors);
		return Object.values(newErrors).every((e) => !e);
	};

	const handleConfirm = () => {
		if (!validate()) return;

		const datetime = to ? `${from}/${to}` : from;
		onConfirm("time", datetime, { datetime });
		onClose();
	};

	const renderInputs = () => {
		switch (mode) {
			case "date":
			case "datetime":
			case "time":
				return (
					<Input
						label="Значение"
						placeholder={mode === "time" ? "09:00" : mode === "date" ? "2025-05-18" : "2025-05-18T09:00"}
						value={from}
						onChange={setFrom}
						error={errors.from}
					/>
				);
			case "range-time":
			case "range-date":
			case "range-datetime":
				return (
					<>
						<Input
							label="С"
							placeholder={mode.includes("time") ? "09:00" : mode.includes("date") ? "2025-05-18" : "2025-05-18T09:00"}
							value={from}
							onChange={setFrom}
							error={errors.from}
						/>
						<Input
							label="По"
							placeholder={mode.includes("time") ? "17:00" : mode.includes("date") ? "2025-05-22" : "2025-05-22T17:00"}
							value={to}
							onChange={setFrom}
							error={errors.to}
						/>
					</>
				);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Вставка <time>" size="md">
			<ModalContent>
				<GridContainer gap="md">
					<RadioGroup label="Тип значения" value={mode} onChange={setMode}>
						<RadioGroup.Option label="Дата" value="date" />
						<RadioGroup.Option label="Дата и время" value="datetime" />
						<RadioGroup.Option label="Время" value="time" />
						<RadioGroup.Option label="Диапазон дат" value="range-date" />
						<RadioGroup.Option label="Диапазон времени" value="range-time" />
						<RadioGroup.Option label="Диапазон даты и времени" value="range-datetime" />
					</RadioGroup>

					<GridContainer gap="md">{renderInputs()}</GridContainer>
				</GridContainer>
			</ModalContent>
			<ModalFooter>
				<Button appearance="solid" tone="error" onClick={onClose}>
					Отмена
				</Button>
				<Button appearance="solid" tone="success" onClick={handleConfirm}>
					Подтвердить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
