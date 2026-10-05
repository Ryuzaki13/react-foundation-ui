import { useState } from "react";

import { Button } from "../../button";
import { Modal, ModalContent, ModalManagerProvider } from "../../modal";

/** Проверяет настоящую композицию Button.title, tooltip и жизненного цикла Modal. */
export function FloatingPopoverModalFixture() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<ModalManagerProvider>
			<Button data-testid="modal-trigger" title="Описание действия" onClick={() => setIsOpen(true)}>
				Открыть
			</Button>
			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<ModalContent>
					<Button data-testid="modal-close" onClick={() => setIsOpen(false)}>
						Закрыть
					</Button>
				</ModalContent>
			</Modal>
		</ModalManagerProvider>
	);
}
