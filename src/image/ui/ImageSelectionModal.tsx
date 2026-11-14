import { Button } from "../../button";
import { Modal, ModalContent, ModalFooter } from "../../modal";
import { UI_TONE_SUCCESS } from "../../uiSchemeConstants";
import { type ImageSelectionModalProps } from "../model/imageSelectionTypes";
import { useImageSelectionState } from "../model/useImageSelectionState";

import { ImageSelectionFields } from "./ImageSelectionFields";

/** Модальная форма выбора изображений с необязательным этапом подтверждения. */
export function ImageSelectionModal({
	disabled,
	isOpen = true,
	onClose = () => {},
	title = "Загрузка нового изображения",
	...props
}: ImageSelectionModalProps) {
	const state = useImageSelectionState({ ...props, disabled });

	if (!props.onApply) {
		return (
			<Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
				<ModalContent scrollable>
					<ImageSelectionFields {...props} disabled={disabled} state={state} />
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
			<ModalContent scrollable>
				<ImageSelectionFields {...props} disabled={disabled} state={state} />
			</ModalContent>
			<ModalFooter>
				<Button disabled={!state.canApply} tone={UI_TONE_SUCCESS} onClick={state.apply}>
					Применить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
