import { type ImageViewerProps } from "../model/imageViewerTypes";

import { MediaViewer } from "./MediaViewer";

/** Галереи изображений используют общий механизм открытия, сохраняя свой публичный контракт. */
export function ImageViewer({ images, ...props }: ImageViewerProps) {
	return <MediaViewer {...props} slides={images} />;
}
