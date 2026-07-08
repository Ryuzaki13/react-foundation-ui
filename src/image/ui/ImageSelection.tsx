import { CSSProperties, ReactNode, useCallback, useMemo, useState } from "react";

import { ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";
import Cropper from "react-easy-crop";

import { Button } from "../../button";
import { GridContainer } from "../../grid";
import { InputText } from "../../input";
import { InputFiles } from "../../input-files";
import { Modal, ModalContent, ModalFooter } from "../../modal";

import { CroppedAreaPixels } from "./ImageCropper";

type SelectedImageFile = Extract<ReadFileResult, { mode: "data-url" }>;

/**
 * Данные одного выбранного изображения, которые нужны вызывающему коду:
 * исходный файл, пользовательское описание и выбранная область обрезки.
 */
export type SelectedImageData = {
	file: SelectedImageFile;
	alt: string;
	crop?: CroppedAreaPixels;
};

interface ImageSelectionPanelProps {
	aspect?: number;
	disabled?: boolean;
	value?: SelectedImageData[];
	defaultValue?: SelectedImageData[];
	onChange?: (data: SelectedImageData[]) => void;
	onApply?: (data: SelectedImageData[]) => void;
	renderActions?: (data: ImageSelectionActionsData) => ReactNode;
}

interface ImageSelectionModalProps extends ImageSelectionPanelProps {
	isOpen?: boolean;
	onClose?: () => void;
	title?: string;
}

interface ImageSelectionActionsData {
	value: SelectedImageData[];
	activeIndex: number;
	hasSelected: boolean;
	canApply: boolean;
	apply: () => void;
}

interface ImageSelectionState extends ImageSelectionActionsData {
	files: SelectedImageFile[];
	activeImage?: SelectedImageData;
	activeCropperState: ImageCropperState;
	setFiles: (files: SelectedImageFile[]) => void;
	setActiveIndex: (index: number) => void;
	setActiveAlt: (alt: string) => void;
	setActiveCrop: (crop: CroppedAreaPixels) => void;
	setActiveCropperCrop: (crop: CropperPoint) => void;
	setActiveCropperZoom: (zoom: number) => void;
}

type ImageSize = {
	width: number;
	height: number;
};

type CropperPoint = {
	x: number;
	y: number;
};

type ImageCropperState = {
	crop: CropperPoint;
	zoom: number;
};

function getImageKey(image: SelectedImageData, index: number) {
	return `${image.file.meta.name}-${image.file.meta.size}-${image.file.meta.lastModified}-${index}`;
}

/**
 * Хранит черновик выбора изображений локально даже в controlled-режиме.
 * Это позволяет не дергать внешний onChange на каждый onCropComplete,
 * а отправлять готовый массив только при явном применении.
 */
function useImageSelectionState({
	value,
	defaultValue,
	disabled,
	onChange,
	onApply
}: Pick<ImageSelectionPanelProps, "value" | "defaultValue" | "disabled" | "onChange" | "onApply">): ImageSelectionState {
	const isControlled = value !== undefined;
	const [draftValue, setDraftValue] = useState<SelectedImageData[]>(value ?? defaultValue ?? []);
	const [controlledValueSnapshot, setControlledValueSnapshot] = useState(value);
	const [requestedActiveIndex, setActiveIndex] = useState(0);
	const [cropperStateByImage, setCropperStateByImage] = useState<Record<string, ImageCropperState>>({});

	if (isControlled && value !== controlledValueSnapshot) {
		setControlledValueSnapshot(value);
		setDraftValue(value ?? []);
	}

	const updateDraftValue = useCallback((updater: (currentValue: SelectedImageData[]) => SelectedImageData[]) => {
		setDraftValue((currentValue) => updater(currentValue));
	}, []);

	const files = useMemo(() => draftValue.map((image) => image.file), [draftValue]);
	const activeIndex = draftValue.length === 0 ? 0 : Math.min(requestedActiveIndex, draftValue.length - 1);
	const activeImage = draftValue[activeIndex];
	const activeImageKey = activeImage ? getImageKey(activeImage, activeIndex) : undefined;
	const activeCropperState = activeImageKey
		? (cropperStateByImage[activeImageKey] ?? { crop: { x: 0, y: 0 }, zoom: 1 })
		: { crop: { x: 0, y: 0 }, zoom: 1 };
	const hasSelected = draftValue.length > 0;
	const canApply = !disabled && hasSelected && draftValue.every((image) => image.alt.trim() && image.crop);

	const setFiles = useCallback(
		(nextFiles: SelectedImageFile[]) => {
			updateDraftValue((currentValue) =>
				nextFiles.map((file) => {
					// Сохраняем alt и crop при переключении, удалении и добавлении файлов.
					const existingImage = currentValue.find((image) => image.file.file === file.file);

					if (existingImage) {
						return { ...existingImage, file };
					}

					return { file, alt: "" };
				})
			);
		},
		[updateDraftValue]
	);

	const setActiveAlt = useCallback(
		(alt: string) => {
			updateDraftValue((currentValue) => currentValue.map((image, index) => (index === activeIndex ? { ...image, alt } : image)));
		},
		[activeIndex, updateDraftValue]
	);

	const setActiveCrop = useCallback(
		(crop: CroppedAreaPixels) => {
			updateDraftValue((currentValue) => currentValue.map((image, index) => (index === activeIndex ? { ...image, crop } : image)));
		},
		[activeIndex, updateDraftValue]
	);

	const setActiveCropperCrop = useCallback(
		(crop: CropperPoint) => {
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
		onChange?.(draftValue);
		onApply?.(draftValue);
	}, [draftValue, onApply, onChange]);

	return {
		value: draftValue,
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

function resolveImageUploadMaxBytes(): number | undefined {
	if (typeof __IMAGE_UPLOAD_MAX_BYTES__ !== "number") return undefined;
	return __IMAGE_UPLOAD_MAX_BYTES__;
}

function getPreviewImageStyle(image: SelectedImageData, size: ImageSize | undefined, aspect: number): CSSProperties {
	if (!image.crop || !size) {
		return {
			width: "100%",
			aspectRatio: aspect,
			objectFit: "cover",
			display: "block"
		};
	}

	const crop = image.crop;

	// Миниатюра масштабирует исходник так, чтобы видимой оставалась только выбранная область crop.
	return {
		position: "absolute",
		left: `${-(crop.x / crop.width) * 100}%`,
		top: `${-(crop.y / crop.height) * 100}%`,
		width: `${(size.width / crop.width) * 100}%`,
		height: `${(size.height / crop.height) * 100}%`,
		maxWidth: "none"
	};
}

function ImageSelectionFields({ aspect = 16 / 9, disabled, state }: { aspect?: number; disabled?: boolean; state: ImageSelectionState }) {
	const area = state.activeImage?.crop;
	const [imageSizes, setImageSizes] = useState<Record<string, ImageSize>>({});

	return (
		<GridContainer gap="md">
			<InputFiles
				label="Файл изображения"
				allowedMime={["image/jpeg", "image/png", "image/webp", "image/avif"]}
				value={state.files}
				onChange={state.setFiles}
				maxBytes={resolveImageUploadMaxBytes()}
				onReadError={(e) => console.log("e", e)}
			/>

			{state.hasSelected && state.activeImage && (
				<div>
					<GridContainer templateColumns="repeat(auto-fill, minmax(10em, 1fr))" gap="xs">
						{state.value.map((image, index) => {
							const imageKey = getImageKey(image, index);

							return (
								<button
									key={imageKey}
									type="button"
									disabled={disabled}
									onClick={() => state.setActiveIndex(index)}
									style={{
										padding: 0,
										border: index === state.activeIndex ? "2px solid var(--border-accent)" : "2px solid transparent",
										background: "transparent",
										cursor: disabled ? "default" : "pointer"
									}}>
									<span
										style={{
											position: "relative",
											display: "block",
											width: "100%",
											aspectRatio: aspect,
											overflow: "hidden"
										}}>
										<img
											src={image.file.dataUrl}
											style={getPreviewImageStyle(image, imageSizes[imageKey], aspect)}
											onLoad={(event) => {
												const target = event.currentTarget;

												setImageSizes((currentSizes) => ({
													...currentSizes,
													[imageKey]: {
														width: target.naturalWidth,
														height: target.naturalHeight
													}
												}));
											}}
										/>
									</span>
								</button>
							);
						})}
					</GridContainer>
					<div>
						Выберите область изображения{" "}
						{area &&
							(area.width < 1200 ? (
								<code className="statusError">
									{area.width}x{area.height} - низкое качество изображения!
								</code>
							) : (
								<code className="statusSuccess">
									{area.width}x{area.height}
								</code>
							))}
					</div>

					<div style={{ position: "relative", width: "100%", aspectRatio: aspect }}>
						<Cropper
							key={getImageKey(state.activeImage, state.activeIndex)}
							image={state.activeImage.file.dataUrl}
							crop={state.activeCropperState.crop}
							zoom={state.activeCropperState.zoom}
							aspect={aspect}
							onCropChange={state.setActiveCropperCrop}
							onZoomChange={state.setActiveCropperZoom}
							onCropComplete={(_croppedArea, croppedAreaPixels) => state.setActiveCrop(croppedAreaPixels)}
							zoomSpeed={0.1}
							objectFit="contain"
						/>
					</div>
				</div>
			)}

			<InputText
				required
				disabled={!state.hasSelected || disabled}
				label="Краткое описание изображения"
				placeholder=""
				value={state.activeImage?.alt ?? ""}
				onChange={state.setActiveAlt}
			/>
		</GridContainer>
	);
}

export function ImageSelectionPanel({ aspect = 16 / 9, disabled, renderActions, ...props }: ImageSelectionPanelProps) {
	const state = useImageSelectionState({ ...props, disabled });
	const actionsData = {
		value: state.value,
		activeIndex: state.activeIndex,
		hasSelected: state.hasSelected,
		canApply: state.canApply,
		apply: state.apply
	};
	const hasApplyHandler = props.onChange !== undefined || props.onApply !== undefined;

	return (
		<>
			<ImageSelectionFields aspect={aspect} disabled={disabled} state={state} />
			{renderActions
				? renderActions(actionsData)
				: hasApplyHandler && (
						<div>
							<Button disabled={!state.canApply} tone="success" onClick={state.apply}>
								Применить
							</Button>
						</div>
					)}
		</>
	);
}

export function ImageSelectionModal({
	aspect = 16 / 9,
	disabled,
	isOpen = true,
	onClose = () => {},
	title = "Загрузка нового изображения",
	...props
}: ImageSelectionModalProps) {
	const state = useImageSelectionState({ ...props, disabled });
	const hasApplyHandler = props.onChange !== undefined || props.onApply !== undefined;

	if (!hasApplyHandler) {
		return (
			<Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
				<ModalContent scrollable>
					<ImageSelectionFields aspect={aspect} disabled={disabled} state={state} />
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
			<ModalContent scrollable>
				<ImageSelectionFields aspect={aspect} disabled={disabled} state={state} />
			</ModalContent>
			<ModalFooter>
				<Button disabled={!state.canApply} tone="success" onClick={state.apply}>
					Применить
				</Button>
			</ModalFooter>
		</Modal>
	);
}
