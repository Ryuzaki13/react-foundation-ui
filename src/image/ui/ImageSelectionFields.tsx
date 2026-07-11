import { useState } from "react";

import { GridContainer } from "../../grid";
import { InputText } from "../../input";
import { InputFiles } from "../../input-files";
import { getImageCropPreviewStyle, type ImageNaturalSize } from "../lib/getImageCropPreviewStyle";
import { getImageSelectionKey } from "../lib/getImageSelectionKey";
import { type ImageSelectionPanelProps, type ImageSelectionState } from "../model/imageSelectionTypes";

import { ImageCropper } from "./ImageCropper";

const DEFAULT_ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

interface ImageSelectionFieldsProps extends Pick<
	ImageSelectionPanelProps,
	"aspect" | "disabled" | "allowedMime" | "maxBytes" | "minimumCropWidth" | "onReadError"
> {
	state: ImageSelectionState;
}

/** Поля выбора файлов, crop и альтернативного текста для активного изображения. */
export function ImageSelectionFields({
	aspect = 16 / 9,
	disabled,
	allowedMime = DEFAULT_ALLOWED_IMAGE_MIME,
	maxBytes,
	minimumCropWidth,
	onReadError,
	state
}: ImageSelectionFieldsProps) {
	const area = state.activeImage?.crop;
	const [imageSizes, setImageSizes] = useState<Record<string, ImageNaturalSize>>({});

	return (
		<GridContainer gap="md">
			<InputFiles
				label="Файл изображения"
				allowedMime={allowedMime}
				value={state.files}
				onChange={state.setFiles}
				maxBytes={maxBytes}
				disabled={disabled}
				onReadError={onReadError}
			/>

			{state.hasSelected && state.activeImage && (
				<div>
					<GridContainer templateColumns="repeat(auto-fill, minmax(10em, 1fr))" gap="xs">
						{state.value.map((image, index) => {
							const imageKey = getImageSelectionKey(image, index);

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
											alt={image.alt || `Предпросмотр изображения ${index + 1}`}
											style={getImageCropPreviewStyle(image, imageSizes[imageKey], aspect)}
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
						{area && (
							<code className={minimumCropWidth && area.width < minimumCropWidth ? "statusError" : "statusSuccess"}>
								{area.width}x{area.height}
								{minimumCropWidth && area.width < minimumCropWidth ? " — недостаточная ширина" : ""}
							</code>
						)}
					</div>

					<ImageCropper
						key={getImageSelectionKey(state.activeImage, state.activeIndex)}
						image={state.activeImage.file.dataUrl}
						crop={state.activeCropperState.crop}
						zoom={state.activeCropperState.zoom}
						aspect={aspect}
						disabled={disabled}
						onCropChange={state.setActiveCropperCrop}
						onZoomChange={state.setActiveCropperZoom}
						onCropComplete={state.setActiveCrop}
					/>
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
