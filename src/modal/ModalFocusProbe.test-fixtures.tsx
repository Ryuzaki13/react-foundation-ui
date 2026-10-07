import { Modal } from "./Modal";
import { ModalContent } from "./ModalContent";
import { ModalFooter } from "./ModalFooter";
import { ModalManagerProvider } from "./ModalManagerProvider";

type ModalFocusProbeProps = Readonly<{
	mounted: boolean;
	isOpen: boolean;
}>;

/** Настоящий Modal проверяется и как persistent owner, и при условном StrictMode mount. */
export function ModalFocusProbe({ mounted, isOpen }: ModalFocusProbeProps) {
	return (
		<ModalManagerProvider>
			<button type="button" data-action="first-modal-trigger">
				Первое открытие
			</button>
			<button type="button" data-action="second-modal-trigger">
				Повторное открытие
			</button>
			{mounted ? (
				<Modal isOpen={isOpen} onClose={() => undefined}>
					<ModalContent>Содержимое</ModalContent>
					<ModalFooter>
						<button type="button" data-action="modal-close">
							Закрыть
						</button>
					</ModalFooter>
				</Modal>
			) : null}
		</ModalManagerProvider>
	);
}
