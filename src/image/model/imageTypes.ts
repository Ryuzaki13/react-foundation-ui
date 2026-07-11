/** Режим размещения изображения внутри доступной области. */
export type ImageLayout = "cover" | "contain" | "intrinsic";

/** Готовый source-дескриптор для прямого отображения через picture. */
export type ImageSource = {
	srcSet: string;
	type?: string;
	sizes?: string;
};

/** Кандидат responsive-изображения с дескриптором физической ширины. */
export type ImageWidthCandidate = {
	src: string;
	width: number;
	density?: never;
};

/** Кандидат responsive-изображения с дескриптором плотности пикселей. */
export type ImageDensityCandidate = {
	src: string;
	density: number;
	width?: never;
};

/** Готовый URL варианта изображения и его стандартный srcset-дескриптор. */
export type ImageCandidate = ImageWidthCandidate | ImageDensityCandidate;

/** Набор кандидатов одного формата для элемента picture/source. */
export type ResponsiveImageSource = {
	candidates: readonly ImageCandidate[];
	type?: string;
	sizes?: string;
};

/**
 * Независимый от хранилища контракт изображения.
 * Все URL и варианты подготавливает вызывающий слой, знакомый со схемой хранения.
 */
export type ResponsiveImageData = {
	src: string;
	alt?: string;
	intrinsicWidth?: number;
	intrinsicHeight?: number;
	candidates?: readonly ImageCandidate[];
	sources?: readonly ResponsiveImageSource[];
};
