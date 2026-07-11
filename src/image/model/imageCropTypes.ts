import { type CSSProperties } from "react";

/** Координаты смещения изображения внутри cropper. */
export type ImageCropPoint = {
	x: number;
	y: number;
};

/** Прямоугольная область обрезки в пикселях или процентах. */
export type ImageCropArea = {
	x: number;
	y: number;
	width: number;
	height: number;
};

/** Способ начального вписывания исходника в область cropper. */
export type ImageCropperObjectFit = "contain" | "cover" | "horizontal-cover" | "vertical-cover";

export interface ImageCropperProps {
	image: string;
	aspect?: number;
	width?: CSSProperties["width"];
	className?: string;
	style?: CSSProperties;
	crop?: ImageCropPoint;
	defaultCrop?: ImageCropPoint;
	zoom?: number;
	defaultZoom?: number;
	minZoom?: number;
	maxZoom?: number;
	zoomSpeed?: number;
	objectFit?: ImageCropperObjectFit;
	disabled?: boolean;
	onCropChange?: (crop: ImageCropPoint) => void;
	onZoomChange?: (zoom: number) => void;
	onCropComplete?: (croppedAreaPixels: ImageCropArea, croppedAreaPercentages: ImageCropArea) => void;
}
