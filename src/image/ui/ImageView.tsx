import { type ImgHTMLAttributes, type ReactNode } from "react";

import { ImageRenderer, type ImageSource } from "./ImageRenderer";

export type ImageFormat = "avif" | "webp" | "jpeg" | "jpg" | "png";

const DEFAULT_SET_WIDTHS = [2880, 1920, 1280, 640, 320] as const;
const DEFAULT_SET_FORMATS = ["avif", "webp"] as const satisfies readonly ImageFormat[];

export type StoredImageData = {
	filename: string;
	path: string;
	width?: number;
	height?: number;
	alt?: string;
	hasSet?: boolean;
};

interface ImageViewProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
	/** Запись из таблицы Image. Предпочтительный способ передать изображение из БД. */
	image?: StoredImageData;
	/** Базовое имя файла из БД. Для новых изображений это md5 без расширения. */
	src?: string;
	/** Путь из БД относительно публичного корня, например `images/articles`. */
	path?: string;
	alt?: string;
	role?: string;
	ariaLabel?: string;
	caption?: string;
	fallback?: ReactNode;
	useFigure?: boolean;
	aspectRatio?: string | "unset";
	/** Форматы, которые реально лежат в хранилище для текущего изображения. */
	formats?: readonly ImageFormat[];
	/** Формат для img.src. Должен существовать в хранилище. */
	fallbackFormat?: ImageFormat;
	/** Набор размеров для файлов вида base@width.format. */
	variantWidths?: readonly number[];
	/** Признак наличия responsive-набора. Если false, @size srcSet не строится. */
	hasSet?: boolean;
}

function getImageMime(format: ImageFormat): string {
	if (format === "jpg" || format === "jpeg") {
		return "image/jpeg";
	}

	return `image/${format}`;
}

function normalizeImagePath(path?: string): string {
	if (!path) return "";

	return path.replace(/^\/+|\/+$/g, "");
}

function buildImageBasePath(path: string | undefined, filename: string): string {
	const normalizedPath = normalizeImagePath(path);

	return normalizedPath ? `/${normalizedPath}/${filename}` : `/${filename}`;
}

function buildImageSources({
	basePath,
	formats,
	variantWidths,
	hasSet
}: {
	basePath: string;
	formats: readonly ImageFormat[];
	variantWidths: readonly number[];
	hasSet: boolean;
}): ImageSource[] {
	if (!hasSet) {
		return formats.map((format) => ({
			srcSet: `${basePath}.${format}`,
			type: getImageMime(format)
		}));
	}

	return formats.map((format) => ({
		srcSet: variantWidths.map((width) => `${basePath}@${width}.${format} ${width}w`).join(", "),
		type: getImageMime(format)
	}));
}

/**
 * Адаптер для изображений из таблицы Image.
 * Компонент строит пути только из данных БД: path + filename + формат/размер.
 */
export function ImageView({
	image,
	src,
	path,
	alt,
	formats = DEFAULT_SET_FORMATS,
	fallbackFormat,
	variantWidths = DEFAULT_SET_WIDTHS,
	hasSet,
	aspectRatio,
	...props
}: ImageViewProps) {
	const filename = image?.filename ?? src;

	if (!filename) {
		return <ImageRenderer src="" alt={alt ?? image?.alt} {...props} />;
	}

	const resolvedPath = image?.path ?? path;
	const resolvedHasSet = hasSet ?? image?.hasSet ?? true;
	const resolvedFormats = formats.length > 0 ? formats : DEFAULT_SET_FORMATS;
	const resolvedFallbackFormat = fallbackFormat ?? resolvedFormats[resolvedFormats.length - 1] ?? "webp";
	const basePath = buildImageBasePath(resolvedPath, filename);
	const resolvedAspectRatio = aspectRatio ?? (image?.width && image.height ? `${image.width} / ${image.height}` : undefined);
	const sources = buildImageSources({
		basePath,
		formats: resolvedFormats,
		variantWidths,
		hasSet: resolvedHasSet
	});

	return (
		<ImageRenderer
			src={`${basePath}.${resolvedFallbackFormat}`}
			sources={sources}
			alt={alt ?? image?.alt}
			aspectRatio={resolvedAspectRatio}
			{...props}
		/>
	);
}
