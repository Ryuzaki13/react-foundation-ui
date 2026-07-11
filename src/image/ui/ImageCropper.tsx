import { useCallback, useState } from "react";

import Cropper from "react-easy-crop";

import { type ImageCropArea, type ImageCropperProps, type ImageCropPoint } from "../model/imageCropTypes";

const DEFAULT_CROP: ImageCropPoint = { x: 0, y: 0 };

/**
 * Управляемая или автономная область обрезки изображения.
 * Числовой aspect задаётся вызывающим кодом и не связан с назначением изображения.
 */
export function ImageCropper({
	image,
	aspect = 16 / 9,
	width = "100%",
	className,
	style,
	crop,
	defaultCrop = DEFAULT_CROP,
	zoom,
	defaultZoom = 1,
	minZoom = 1,
	maxZoom = 3,
	zoomSpeed = 0.1,
	objectFit = "contain",
	disabled = false,
	onCropChange,
	onZoomChange,
	onCropComplete
}: ImageCropperProps) {
	const [uncontrolledCrop, setUncontrolledCrop] = useState(defaultCrop);
	const [uncontrolledZoom, setUncontrolledZoom] = useState(defaultZoom);
	const resolvedCrop = crop ?? uncontrolledCrop;
	const resolvedZoom = zoom ?? uncontrolledZoom;

	const handleCropChange = useCallback(
		(nextCrop: ImageCropPoint) => {
			if (disabled) return;

			if (crop === undefined) {
				setUncontrolledCrop(nextCrop);
			}

			onCropChange?.(nextCrop);
		},
		[crop, disabled, onCropChange]
	);

	const handleZoomChange = useCallback(
		(nextZoom: number) => {
			if (disabled) return;

			if (zoom === undefined) {
				setUncontrolledZoom(nextZoom);
			}

			onZoomChange?.(nextZoom);
		},
		[disabled, onZoomChange, zoom]
	);

	const handleCropComplete = useCallback(
		(croppedAreaPercentages: ImageCropArea, croppedAreaPixels: ImageCropArea) => {
			if (disabled) return;

			onCropComplete?.(croppedAreaPixels, croppedAreaPercentages);
		},
		[disabled, onCropComplete]
	);

	return (
		<div
			className={className}
			style={{ position: "relative", width, aspectRatio: aspect, pointerEvents: disabled ? "none" : undefined, ...style }}>
			<Cropper
				image={image}
				crop={resolvedCrop}
				zoom={resolvedZoom}
				aspect={aspect}
				minZoom={minZoom}
				maxZoom={maxZoom}
				zoomSpeed={zoomSpeed}
				objectFit={objectFit}
				onCropChange={handleCropChange}
				onZoomChange={handleZoomChange}
				onCropComplete={handleCropComplete}
				cropperProps={{ "aria-disabled": disabled || undefined }}
			/>
		</div>
	);
}
