import { type ImageViewerLabels } from "../model/imageViewerTypes";

const DEFAULT_IMAGE_VIEWER_LABELS: ImageViewerLabels = {
	previous: "Предыдущее изображение",
	next: "Следующее изображение",
	close: "Закрыть просмотр",
	slide: "Изображение",
	carousel: "Карусель изображений",
	lightbox: "Просмотр изображений",
	photoGallery: "Галерея изображений",
	slideCounter: "{index} из {total}",
	zoomIn: "Увеличить",
	zoomOut: "Уменьшить",
	enterFullscreen: "Перейти в полноэкранный режим",
	exitFullscreen: "Выйти из полноэкранного режима",
	thumbnails: "Миниатюры",
	showThumbnails: "Показать миниатюры",
	hideThumbnails: "Скрыть миниатюры",
	caption: "Подпись изображения",
	showCaptions: "Показать подписи",
	hideCaptions: "Скрыть подписи",
	download: "Скачать изображение"
};

/** Преобразует стабильные semantic labels foundation в ключи локализации YARL. */
export function resolveImageViewerLabels(overrides: Partial<ImageViewerLabels> | undefined) {
	const labels = { ...DEFAULT_IMAGE_VIEWER_LABELS, ...overrides };

	return {
		Previous: labels.previous,
		Next: labels.next,
		Close: labels.close,
		Slide: labels.slide,
		Carousel: labels.carousel,
		Lightbox: labels.lightbox,
		"Photo gallery": labels.photoGallery,
		"{index} of {total}": labels.slideCounter,
		"Zoom in": labels.zoomIn,
		"Zoom out": labels.zoomOut,
		"Enter Fullscreen": labels.enterFullscreen,
		"Exit Fullscreen": labels.exitFullscreen,
		Thumbnails: labels.thumbnails,
		"Show thumbnails": labels.showThumbnails,
		"Hide thumbnails": labels.hideThumbnails,
		Caption: labels.caption,
		"Show captions": labels.showCaptions,
		"Hide captions": labels.hideCaptions,
		Download: labels.download
	};
}
