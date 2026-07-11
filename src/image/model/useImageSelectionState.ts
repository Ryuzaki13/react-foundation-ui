import { useCallback, useMemo, useState } from "react";

import { getImageSelectionKey } from "../lib/getImageSelectionKey";

import { type ImageCropArea, type ImageCropPoint } from "./imageCropTypes";
import {
	type ImageCropperState,
	type ImageSelectionPanelProps,
	type ImageSelectionState,
	type SelectedImageData,
	type SelectedImageFile
} from "./imageSelectionTypes";

const INITIAL_CROPPER_STATE: ImageCropperState = { crop: { x: 0, y: 0 }, zoom: 1 };

/**
 * Управляет набором изображений в conventional controlled/uncontrolled-режиме.
 * В controlled-режиме каждое изменение сразу передаётся через onChange, а источник истины остаётся у вызывающего кода.
 */
export function useImageSelectionState({
	value,
	defaultValue,
	disabled,
	onChange,
	onApply
}: Pick<ImageSelectionPanelProps, "value" | "defaultValue" | "disabled" | "onChange" | "onApply">): ImageSelectionState {
	const [uncontrolledValue, setUncontrolledValue] = useState<SelectedImageData[]>(defaultValue ?? []);
	const [requestedActiveIndex, setActiveIndex] = useState(0);
	const [cropperStateByImage, setCropperStateByImage] = useState<Record<string, ImageCropperState>>({});
	const resolvedValue = value ?? uncontrolledValue;

	const updateValue = useCallback(
		(updater: (currentValue: SelectedImageData[]) => SelectedImageData[]) => {
			const nextValue = updater(resolvedValue);

			if (value === undefined) {
				setUncontrolledValue(nextValue);
			}

			onChange?.(nextValue);
		},
		[onChange, resolvedValue, value]
	);

	const files = useMemo(() => resolvedValue.map((image) => image.file), [resolvedValue]);
	const activeIndex = resolvedValue.length === 0 ? 0 : Math.min(requestedActiveIndex, resolvedValue.length - 1);
	const activeImage = resolvedValue[activeIndex];
	const activeImageKey = activeImage ? getImageSelectionKey(activeImage, activeIndex) : undefined;
	const activeCropperState = activeImageKey ? (cropperStateByImage[activeImageKey] ?? INITIAL_CROPPER_STATE) : INITIAL_CROPPER_STATE;
	const hasSelected = resolvedValue.length > 0;
	const canApply = !disabled && hasSelected && resolvedValue.every((image) => image.alt.trim() && image.crop);

	const setFiles = useCallback(
		(nextFiles: SelectedImageFile[]) => {
			updateValue((currentValue) =>
				nextFiles.map((file) => {
					// Сохраняем описание и crop для файлов, которые остались в выборе.
					const existingImage = currentValue.find((image) => image.file.file === file.file);

					return existingImage ? { ...existingImage, file } : { file, alt: "" };
				})
			);
		},
		[updateValue]
	);

	const setActiveAlt = useCallback(
		(alt: string) => {
			updateValue((currentValue) => currentValue.map((image, index) => (index === activeIndex ? { ...image, alt } : image)));
		},
		[activeIndex, updateValue]
	);

	const setActiveCrop = useCallback(
		(crop: ImageCropArea) => {
			updateValue((currentValue) => currentValue.map((image, index) => (index === activeIndex ? { ...image, crop } : image)));
		},
		[activeIndex, updateValue]
	);

	const setActiveCropperCrop = useCallback(
		(crop: ImageCropPoint) => {
			if (!activeImageKey) return;

			setCropperStateByImage((currentState) => ({
				...currentState,
				[activeImageKey]: {
					crop,
					zoom: currentState[activeImageKey]?.zoom ?? 1
				}
			}));
		},
		[activeImageKey]
	);

	const setActiveCropperZoom = useCallback(
		(zoom: number) => {
			if (!activeImageKey) return;

			setCropperStateByImage((currentState) => ({
				...currentState,
				[activeImageKey]: {
					crop: currentState[activeImageKey]?.crop ?? { x: 0, y: 0 },
					zoom
				}
			}));
		},
		[activeImageKey]
	);

	const apply = useCallback(() => {
		onApply?.(resolvedValue);
	}, [onApply, resolvedValue]);

	return {
		value: resolvedValue,
		files,
		activeIndex,
		activeImage,
		activeCropperState,
		hasSelected,
		canApply,
		apply,
		setFiles,
		setActiveIndex,
		setActiveAlt,
		setActiveCrop,
		setActiveCropperCrop,
		setActiveCropperZoom
	};
}
