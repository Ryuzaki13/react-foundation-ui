import { type MouseEvent, useEffect, useState } from "react";

import { isSafe, validateUrl } from "@ryuzaki13/react-foundation-lib/validators";

import { Button } from "../button";
import { CheckBox } from "../check-box";
import { GridContainer } from "../grid";
import { Input } from "../input";
import { Modal, ModalContent, ModalFooter } from "../modal";

import { LinkType } from "./linkTypes";

interface LinkDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (url: string, text: string, add: string, ariaLabel: string, showQrCode: boolean) => void;
	initialState?: LinkType;
}

/**
 * Диалог вставки или редактирования ссылки в текстовом редакторе.
 */
export function LinkDialog({ isOpen, onClose, onConfirm, initialState }: LinkDialogProps) {
	const [url, setUrl] = useState("");
	const [ariaLabel, setAriaLabel] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [showQrCode, setShowQrCode] = useState(false);
	const [state] = useState(() => {
		if (isSafe(initialState)) {
			if (typeof initialState === "string") {
				return { text: "", add: "", ariaLabel: "", url: initialState };
			}
		}
		return initialState;
	});

	useEffect(() => {
		if (isOpen) {
			if (isSafe(state)) {
				setUrl(state.url ?? "");
				setAriaLabel(state.ariaLabel ?? "");
			}
		}
	}, [isOpen, state]);

	const handleUrlChange = (value: string) => {
		setUrl(value);

		// Очищаем ошибку при изменении URL
		if (error) {
			setError(null);
		}
	};

	const handleConfirm = (e: MouseEvent) => {
		e.preventDefault();

		const validation = validateUrl(url);
		if (!validation.isValid) {
			setError(validation.error);
			return;
		}

		if (!ariaLabel) {
			setError("добавьте описание для ссылки");
			return;
		}

		// Добавляем протокол, если его нет
		const finalUrl = url.startsWith("http") ? url : `https://${url}`;
		onConfirm(finalUrl, "", "", ariaLabel, showQrCode);
		handleClose();
	};

	const handleClose = () => {
		setUrl("");
		setAriaLabel("");
		setError(null);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Ссылка на внешний url" size="md">
			<ModalContent>
				<GridContainer gap="md">
					<Input label="Полный URL адрес" value={url} onChange={handleUrlChange} placeholder="https://somesite.ru" />

					{error && (
						<div className="textColorDanger">
							<strong>Ошибка ввода:</strong> <span className="fontItalic">{error}</span>
						</div>
					)}

					<Input
						label="Текст для экранных читалок"
						value={ariaLabel}
						onChange={setAriaLabel}
						placeholder="Ссылка на официальный сайт городской думмы"
					/>

					<CheckBox title="Показать кнопку для генерации QR кода ссылки" value={showQrCode} onChange={setShowQrCode} />
				</GridContainer>
			</ModalContent>
			<ModalFooter>
				<Button appearance="outline" tone="error" onClick={handleClose}>
					Отмена
				</Button>
				<Button appearance="outline" tone="success" onClick={handleConfirm} disabled={!url || !ariaLabel}>
					Подтвердить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
