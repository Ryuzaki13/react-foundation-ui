import { type Slide } from "yet-another-react-lightbox";

import { type ImageCandidate } from "../model/imageTypes";
import { type ImageViewerImage } from "../model/imageViewerTypes";

/** Проверяет размер до передачи в srcset внешней lightbox-библиотеки. */
function isPositiveFinite(value: number): boolean {
	return Number.isFinite(value) && value > 0;
}

/**
 * Преобразует width- и density-кандидат в физическую ширину.
 * Density имеет смысл только вместе с известной intrinsic-шириной базового изображения.
 */
function resolveCandidateWidth(candidate: ImageCandidate, intrinsicWidth: number): number | null {
	const width =
		candidate.width !== undefined ? candidate.width : candidate.density !== undefined ? intrinsicWidth * candidate.density : 0;

	return isPositiveFinite(width) ? Math.round(width) : null;
}

/**
 * Строит srcSet YARL, которому для каждого варианта нужны одновременно width и height.
 * Альтернативные picture sources намеренно остаются контрактом ImageView: YARL 3.x не поддерживает их
 * в стандартном image slide, а custom slide лишает viewer встроенного responsive preload и Zoom.
 */
function buildLightboxSrcSet(image: ImageViewerImage): Slide["srcSet"] {
	const { intrinsicWidth, intrinsicHeight } = image;

	if (
		intrinsicWidth === undefined ||
		intrinsicHeight === undefined ||
		!isPositiveFinite(intrinsicWidth) ||
		!isPositiveFinite(intrinsicHeight)
	) {
		return undefined;
	}

	const candidatesByWidth = new Map<number, { src: string; width: number; height: number }>();

	for (const candidate of image.candidates ?? []) {
		const candidateWidth = resolveCandidateWidth(candidate, intrinsicWidth);

		if (candidateWidth === null || candidatesByWidth.has(candidateWidth)) continue;

		candidatesByWidth.set(candidateWidth, {
			src: candidate.src,
			width: candidateWidth,
			height: Math.max(1, Math.round((candidateWidth * intrinsicHeight) / intrinsicWidth))
		});
	}

	const candidates = [...candidatesByWidth.values()].sort((left, right) => left.width - right.width);
	return candidates.length > 0 ? candidates : undefined;
}

/**
 * Адаптирует storage-agnostic ResponsiveImageData к image slides Yet Another React Lightbox.
 * Функция остаётся приватной для `/image`, чтобы vendor contract не становился public API пакета.
 */
export function buildImageViewerSlides(images: readonly ImageViewerImage[]): Slide[] {
	return images.map((image) => {
		const hasIntrinsicSize = isPositiveFinite(image.intrinsicWidth ?? 0) && isPositiveFinite(image.intrinsicHeight ?? 0);

		return {
			src: image.src,
			alt: image.alt,
			width: hasIntrinsicSize ? image.intrinsicWidth : undefined,
			height: hasIntrinsicSize ? image.intrinsicHeight : undefined,
			srcSet: buildLightboxSrcSet(image),
			title: image.title === undefined ? image.alt : image.title,
			description: image.description,
			thumbnail: image.thumbnail,
			download: image.download
		};
	});
}
