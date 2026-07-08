import { type MouseEvent, useEffect, useState } from "react";

import { formatPhone } from "@ryuzaki13/react-foundation-lib/formatters";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { isSafe } from "@ryuzaki13/react-foundation-lib/validators";

import { Button } from "../button";
import { GridContainer } from "../grid";
import { Input } from "../input";
import { Modal, ModalContent, ModalFooter } from "../modal";

import { LinkType } from "./linkTypes";

interface PhoneDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (url: string, text: string, add: string, ariaLabel: string, showQrCode: boolean) => void;
	initialState?: LinkType;
}

/**
 * Диалог вставки или редактирования телефонной ссылки в текстовом редакторе.
 */
export function PhoneDialog({ isOpen, onClose, onConfirm, initialState }: PhoneDialogProps) {
	const [phone, setPhone] = useState("");
	const [phoneAdd, setPhoneAdd] = useState("");
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
				setPhone((state.url ?? "").replace(/\D/g, "").slice(0, 11).replace(/^7/, ""));

				if (!state.add) {
					setPhoneAdd((state.url ?? "").replace(/\D/g, "").slice(11));
				} else {
					setPhoneAdd((state.add ?? "").replace(/\D/g, ""));
				}

				setAriaLabel(state.ariaLabel ?? "");
			}
		}
	}, [isOpen, state]);

	const handlePhoneChange = (value: string) => {
		value = value.replace(/\D/g, "");
		if (value.length <= 10) {
			setPhone(value);
			setError(null);
		} else {
			setError("нельзя ввести более 10 цифр");
		}
	};

	const validatePhone = (phone: string): boolean => {
		if (phone.length !== 10) {
			setError("номер телефона должен содержать 10 цифр");
			return false;
		}
		return true;
	};

	const handleConfirm = (e: MouseEvent) => {
		e.preventDefault();

		if (!validatePhone(phone)) return;
		if (!ariaLabel) {
			setError("добавьте описание для телефона");
			return;
		}

		const formattedPhone = formatPhone(phone);
		const fullPhone = `+7${phone}`;
		onConfirm(`tel:${fullPhone}`, phoneAdd ? `${formattedPhone} доб. ${phoneAdd}` : formattedPhone, phoneAdd, ariaLabel, false);
		handleClose();
	};

	const handleClose = () => {
		setPhone("");
		setAriaLabel("");
		setError(null);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Ссылка на телефон" size="md">
			<ModalContent>
				<GridContainer gap="md">
					<div className={cn("flex", "alignItemsEnd", "gapSm")}>
						<Input
							label="Номер телефона без 7-ки"
							description="Вводится только номер (10) цифр без каких-либо дополнительных символов. Ссылка будет привязана к текущему выделенному фрагменту текста. Поэтому текст самой ссылки можно оформить грамотно, например: +7 (3522) 12-34-56 доб. 100"
							value={phone}
							onChange={handlePhoneChange}
							placeholder="3522123456"
							className="flex1"
						/>
						<Input label="Добавочный номер" value={phoneAdd} onChange={setPhoneAdd} placeholder="100" />
					</div>
					{error && (
						<div className="textColorDanger">
							<strong>Ошибка ввода:</strong> <span className="fontItalic">{error}</span>
						</div>
					)}

					<Input
						label="Текст для экранных читалок"
						description="Обязательное поле для организации доступности ссылки для лиц с ОВЗ, использующих скринридеры"
						value={ariaLabel}
						onChange={setAriaLabel}
						placeholder="Контактный телефон директора"
					/>
				</GridContainer>
			</ModalContent>
			<ModalFooter>
				<Button appearance="solid" tone="error" onClick={handleClose}>
					Отмена
				</Button>
				<Button appearance="solid" tone="success" onClick={handleConfirm} disabled={!phone || !ariaLabel}>
					Подтвердить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
