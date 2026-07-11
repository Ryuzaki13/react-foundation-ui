import { type CSSProperties } from "react";

import { type SelectedImageData } from "../model/imageSelectionTypes";

export type ImageNaturalSize = {
	width: number;
	height: number;
};

/** Масштабирует preview так, чтобы контейнер показывал только выбранную область crop. */
export function getImageCropPreviewStyle(image: SelectedImageData, size: ImageNaturalSize | undefined, aspect: number): CSSProperties {
	if (!image.crop || !size) {
		return {
			width: "100%",
			aspectRatio: aspect,
			objectFit: "cover",
			display: "block"
		};
	}

	const crop = image.crop;

	return {
		position: "absolute",
		left: `${-(crop.x / crop.width) * 100}%`,
		top: `${-(crop.y / crop.height) * 100}%`,
		width: `${(size.width / crop.width) * 100}%`,
		height: `${(size.height / crop.height) * 100}%`,
		maxWidth: "none"
	};
}
