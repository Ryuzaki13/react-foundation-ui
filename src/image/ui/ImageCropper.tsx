import { useCallback, useState } from "react";

import Cropper from "react-easy-crop";

export type CroppedAreaPixels = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export function ImageCropper({
	image,
	aspect = 1200 / 630,
	width,
	onCropComplete
}: {
	image: string;
	aspect?: number;
	width?: number;
	onCropComplete?: (croppedAreaPixels: CroppedAreaPixels) => void;
}) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

	const handleCropComplete = useCallback(
		(_croppedArea: unknown, croppedAreaPixels: CroppedAreaPixels) => {
			onCropComplete?.(croppedAreaPixels);
		},
		[onCropComplete]
	);

	return (
		<div style={{ position: "relative", width: width ?? "100%", aspectRatio: aspect }}>
			<Cropper
				image={image}
				crop={crop}
				zoom={zoom}
				aspect={aspect}
				onCropChange={setCrop}
				onZoomChange={setZoom}
				onCropComplete={handleCropComplete}
				zoomSpeed={0.1}
				objectFit="contain"
			/>
		</div>
	);
}
