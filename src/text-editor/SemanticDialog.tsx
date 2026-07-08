import { type ReactNode, useEffect, useState } from "react";

import { Button } from "../button";
import { GridContainer } from "../grid";
import { Input } from "../input";
import { Modal, ModalContent, ModalFooter } from "../modal";

export interface AttributeField {
	name: string;
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	validate?: (value: string) => string | null;
}

export interface SemanticTagConfig {
	tagName: string;
	title: string;
	description: string;
	example: ReactNode;
	fields: AttributeField[];
}

interface SemanticDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (tagName: string, text: string, attributes: Record<string, string>) => void;
	config: SemanticTagConfig;
	initialState?: Record<string, string>;
	initialText?: string;
}

/**
 * Диалог настройки семантического тега и его атрибутов в текстовом редакторе.
 */
export function SemanticDialog({ isOpen, onClose, onConfirm, config, initialText = "", initialState = {} }: SemanticDialogProps) {
	const [text, setText] = useState(initialText);
	const [values, setValues] = useState<Record<string, string>>({});
	const [errors, setErrors] = useState<Record<string, string | null>>({});
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (isOpen && !initialized) {
			const initial = config.fields.reduce(
				(acc, field) => {
					acc[field.name] = initialState[field.name] ?? "";
					return acc;
				},
				{} as Record<string, string>
			);
			setValues(initial);
			setErrors({});
			setInitialized(true);
		} else if (!isOpen && initialized) {
			setInitialized(false); // сбрасываем при закрытии
		}
	}, [isOpen, config.fields, initialState, initialized]);

	const handleChange = (name: string, value: string) => {
		setValues((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: null }));
	};

	const validate = (): boolean => {
		const newErrors: Record<string, string | null> = {};
		let isValid = true;

		if (!text.trim()) {
			newErrors["text"] = "Обязательное поле";
			isValid = false;
		}

		for (const field of config.fields) {
			const value = values[field.name]?.trim();
			if (field.required && !value) {
				newErrors[field.name] = "Обязательное поле";
				isValid = false;
			} else if (field.validate) {
				const err = field.validate(value);
				if (err) {
					newErrors[field.name] = err;
					isValid = false;
				}
			}
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleConfirm = () => {
		if (!validate()) return;
		onConfirm(config.tagName, text.trim(), values);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Вставка <${config.tagName}>`} size="md">
			<ModalContent>
				<GridContainer gap="md">
					<div>
						{config.description}.<br />
					</div>

					<div>
						<strong>Пример:</strong> {config.example}
					</div>

					<Input
						label={config.title}
						description={`Данный текст будет вставлен в редактор и обёрнуть в специальный семантический тег ${config.tagName}`}
						value={text}
						onChange={setText}
						error={errors["text"] ?? undefined}
						required
					/>
					{config.fields.map((field) => {
						return (
							<Input
								key={field.name}
								label={field.label}
								description={field.description}
								placeholder={field.placeholder}
								value={values[field.name] ?? ""}
								onChange={(value) => handleChange(field.name, value)}
								error={errors[field.name] ?? undefined}
								required={field.required}
							/>
						);
					})}
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
