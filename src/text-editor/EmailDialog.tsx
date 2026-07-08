import { type MouseEvent, useEffect, useState } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { isSafe } from "@ryuzaki13/react-foundation-lib/validators";

import { Button } from "../button";
import { Input } from "../input";
import { Modal, ModalContent, ModalFooter } from "../modal";

import { LinkType } from "./linkTypes";

interface EmailDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (url: string, text: string, add: string, ariaLabel: string, showQrCode: boolean) => void;
	initialState?: LinkType;
}

/**
 * Диалог вставки или редактирования email-ссылки в текстовом редакторе.
 */
export function EmailDialog({ isOpen, onClose, onConfirm, initialState }: EmailDialogProps) {
	const [email, setEmail] = useState("");
	const [ariaLabel, setAriaLabel] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [state] = useState(() => {
		if (isSafe(initialState) && typeof initialState === "string") {
			return { text: "", add: "", ariaLabel: "", url: initialState };
		}

		return initialState;
	});

	useEffect(() => {
		if (isOpen) {
			if (isSafe(state)) {
				setEmail(state.url ?? "");
				setAriaLabel(state.ariaLabel ?? "");
			}
		}
	}, [isOpen, state]);

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError("Некорректный email адрес");
			return false;
		}
		return true;
	};

	const handleConfirm = (e: MouseEvent) => {
		e.preventDefault();

		if (!validateEmail(email)) return;
		if (!ariaLabel) {
			setError("Добавьте описание для email");
			return;
		}

		onConfirm(`mailto:${email}`, "", "", ariaLabel, false);
		handleClose();
	};

	const handleClose = () => {
		setEmail("");
		setAriaLabel("");
		setError(null);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Ссылка на email" size="md">
			<ModalContent>
				<div className={cn("flexColumn", "gapMd")}>
					<Input label="Email адрес" value={email} onChange={setEmail} placeholder="some_email@mail.ru" />

					{error && (
						<div className="textColorDanger">
							<strong>Ошибка ввода:</strong> <span className="fontItalic">{error}</span>
						</div>
					)}

					<Input
						label="Текст для экранных читалок"
						value={ariaLabel}
						onChange={setAriaLabel}
						placeholder="Электронная почта руководителя городской думмы"
					/>
				</div>
			</ModalContent>
			<ModalFooter>
				<Button appearance="outline" tone="error" onClick={handleClose}>
					Отмена
				</Button>
				<Button appearance="outline" tone="success" onClick={handleConfirm} disabled={!email || !ariaLabel}>
					Подтвердить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
