import { type ImgHTMLAttributes } from "react";

import { buildImageSources } from "../lib/buildImageSources";
import { buildImageSrcSet } from "../lib/buildImageSrcSet";
import { type ResponsiveImageData } from "../model/imageTypes";

import { ImageRenderer, type ImageRendererProps } from "./ImageRenderer";

export interface ImageViewProps
	extends
		Omit<ImageRendererProps, "src" | "sources" | "alt" | "intrinsicWidth" | "intrinsicHeight" | "srcSet" | "sizes">,
		Pick<ImgHTMLAttributes<HTMLImageElement>, "sizes"> {
	image: ResponsiveImageData;
	alt?: string;
}

/**
 * Собирает picture/srcset из готовых URL и делегирует отображение ImageRenderer.
 * Компонент не формирует имена файлов и не знает о форматах или размерах хранилища.
 */
export function ImageView({ image, alt, sizes, aspectRatio, ...props }: ImageViewProps) {
	const sources = buildImageSources(image.sources, sizes);
	const srcSet = image.candidates ? buildImageSrcSet(image.candidates) : undefined;
	const resolvedAspectRatio =
		aspectRatio ?? (image.intrinsicWidth && image.intrinsicHeight ? `${image.intrinsicWidth} / ${image.intrinsicHeight}` : undefined);

	return (
		<ImageRenderer
			{...props}
			src={image.src}
			srcSet={srcSet || undefined}
			sources={sources}
			sizes={sizes}
			alt={alt ?? image.alt}
			intrinsicWidth={image.intrinsicWidth}
			intrinsicHeight={image.intrinsicHeight}
			aspectRatio={resolvedAspectRatio}
		/>
	);
}
