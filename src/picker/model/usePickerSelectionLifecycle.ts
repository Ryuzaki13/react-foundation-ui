import { useEffect, useEffectEvent, useRef, useState } from "react";

interface UsePickerSelectionLifecycleOptions<TValue> {
	value: TValue;
	open: boolean;
	onCommit: (value: TValue) => void;
	onOpen?: () => void;
	onClose?: (value: TValue) => void;
	isEqual: (left: TValue, right: TValue) => boolean;
}

/**
 * Общий жизненный цикл чернового выбора для picker-компонентов,
 * где изменения подтверждаются при закрытии popup.
 */
export function usePickerSelectionLifecycle<TValue>({
	value,
	open,
	onCommit,
	onOpen,
	onClose,
	isEqual
}: UsePickerSelectionLifecycleOptions<TValue>) {
	const previousOpenRef = useRef(false);
	const [draftValue, setDraftValue] = useState(value);
	const syncDraftValue = useEffectEvent((value: TValue) => setDraftValue(value));

	useEffect(() => {
		if (!open) {
			syncDraftValue(value);
		}
	}, [open, value]);

	useEffect(() => {
		if (previousOpenRef.current && !open) {
			if (!isEqual(draftValue, value)) {
				onCommit(draftValue);
			}

			onClose?.(draftValue);
		}

		previousOpenRef.current = open;
	}, [draftValue, isEqual, onClose, onCommit, open, value]);

	const prepareOpen = () => {
		setDraftValue(value);
		onOpen?.();
	};

	return {
		draftValue,
		setDraftValue,
		prepareOpen
	};
}
