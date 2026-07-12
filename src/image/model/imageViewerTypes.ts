import { type CSSProperties, type ReactNode } from "react";

import { type ResponsiveImageData } from "./imageTypes";

type ImageViewerDownload = false | string | { readonly url: string; readonly filename: string };

/**
 * Изображение lightbox поверх базового responsive-контракта.
 * Дополнительные поля описывают только представление в viewer и не связывают primitive со схемой хранения.
 */
export type ImageViewerImage = ResponsiveImageData & {
	readonly title?: ReactNode;
	readonly description?: ReactNode;
	readonly thumbnail?: string;
	readonly download?: ImageViewerDownload;
};

/** Набор независимо включаемых возможностей ImageViewer. */
export type ImageViewerFeatures = {
	readonly captions?: boolean;
	readonly counter?: boolean;
	readonly download?: boolean;
	readonly fullscreen?: boolean;
	readonly thumbnails?: boolean;
	readonly zoom?: boolean;
};

/**
 * Семантические подписи viewer без раскрытия ключей конкретной lightbox-библиотеки.
 * Шаблон slideCounter поддерживает маркеры `{index}` и `{total}`.
 */
export type ImageViewerLabels = {
	readonly previous: string;
	readonly next: string;
	readonly close: string;
	readonly slide: string;
	readonly carousel: string;
	readonly lightbox: string;
	readonly photoGallery: string;
	readonly slideCounter: string;
	readonly zoomIn: string;
	readonly zoomOut: string;
	readonly enterFullscreen: string;
	readonly exitFullscreen: string;
	readonly thumbnails: string;
	readonly showThumbnails: string;
	readonly hideThumbnails: string;
	readonly caption: string;
	readonly showCaptions: string;
	readonly hideCaptions: string;
	readonly download: string;
};

type ImageViewerCssVariable =
	| "--image-viewer-z-index"
	| "--image-viewer-backdrop"
	| "--image-viewer-control-color"
	| "--image-viewer-control-active-color"
	| "--image-viewer-control-disabled-color"
	| "--image-viewer-control-background"
	| "--image-viewer-control-border"
	| "--image-viewer-control-radius"
	| "--image-viewer-control-filter"
	| "--image-viewer-icon-size"
	| "--image-viewer-icon-stroke-width"
	| "--image-viewer-toolbar-padding"
	| "--image-viewer-focus"
	| "--image-viewer-focus-offset"
	| "--image-viewer-image-radius"
	| "--image-viewer-caption-background"
	| "--image-viewer-caption-color"
	| "--image-viewer-counter-color"
	| "--image-viewer-thumbnail-background"
	| "--image-viewer-thumbnail-border-color"
	| "--image-viewer-thumbnail-active-border-color"
	| "--image-viewer-loading-color"
	| "--image-viewer-error-color";

/** Inline-стили viewer с типизированным публичным набором CSS-переменных. */
export type ImageViewerStyle = CSSProperties & Partial<Record<ImageViewerCssVariable, string | number>>;

/** Публичный controlled-контракт полноэкранного просмотра изображений. */
export type ImageViewerProps = {
	readonly open: boolean;
	readonly images: readonly ImageViewerImage[];
	readonly index?: number;
	readonly onClose: () => void;
	readonly onIndexChange?: (index: number) => void;
	readonly features?: ImageViewerFeatures;
	readonly loop?: boolean;
	readonly closeOnBackdropClick?: boolean;
	readonly closeOnPullDown?: boolean;
	readonly labels?: Partial<ImageViewerLabels>;
	readonly className?: string;
	readonly style?: ImageViewerStyle;
};
