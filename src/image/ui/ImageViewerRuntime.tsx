import { useEffect, useMemo } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import {
	CaptionsIcon,
	CaptionsOffIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
	GalleryThumbnailsIcon,
	ImageOffIcon,
	LoaderCircleIcon,
	Maximize2Icon,
	Minimize2Icon,
	XIcon,
	ZoomInIcon,
	ZoomOutIcon
} from "lucide-react";
import Lightbox, { isImageSlide, type LightboxExternalProps, type Plugin } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { buildImageViewerSlides } from "../lib/buildImageViewerSlides";
import { resolveImageViewerLabels } from "../lib/resolveImageViewerLabels";
import { type ImageViewerProps } from "../model/imageViewerTypes";

import styles from "./ImageViewer.module.scss";

type ImageViewerRuntimeProps = ImageViewerProps & {
	readonly onRuntimeMounted: () => void;
};

/** Внутренняя высота резервируемой верхней строки не является публичной CSS-переменной viewer. */
const IMAGE_VIEWER_TOP_ROW_HEIGHT = "var(--_image-viewer-top-row-height)";

/**
 * Тяжёлый runtime ImageViewer, изолированный в отдельном динамическом chunk.
 * Компонент приватен для `/image`: YARL-типы и plugin-контракты не должны становиться API foundation.
 */
export default function ImageViewerRuntime({
	open,
	images,
	index = 0,
	onClose,
	onIndexChange,
	features,
	loop = false,
	closeOnBackdropClick = true,
	closeOnPullDown = true,
	labels,
	className,
	style,
	onRuntimeMounted
}: ImageViewerRuntimeProps) {
	useEffect(() => {
		// Оболочка сохраняет runtime после первого commit, чтобы не прерывать внутренний close lifecycle YARL.
		onRuntimeMounted();
	}, [onRuntimeMounted]);

	// Стабильная ссылка предотвращает внешний reset текущего slide при несвязанном rerender родителя.
	const slides = useMemo(() => buildImageViewerSlides(images), [images]);
	const requestedIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
	const resolvedIndex = slides.length > 0 ? Math.min(Math.max(requestedIndex, 0), slides.length - 1) : 0;
	const hasCaptions = images.some((image) => {
		const title = image.title === undefined ? image.alt : image.title;
		return (title !== undefined && title !== null) || (image.description !== undefined && image.description !== null);
	});
	const captionsEnabled = features?.captions ?? hasCaptions;
	const counterEnabled = features?.counter ?? slides.length > 1;
	const downloadEnabled = features?.download ?? false;
	const fullscreenEnabled = features?.fullscreen ?? true;
	const thumbnailsEnabled = features?.thumbnails ?? slides.length > 1;
	const zoomEnabled = features?.zoom ?? true;
	const plugins = useMemo<Plugin[]>(
		() => [
			...(captionsEnabled ? [Captions] : []),
			...(counterEnabled ? [Counter] : []),
			...(downloadEnabled ? [Download] : []),
			...(fullscreenEnabled ? [Fullscreen] : []),
			...(thumbnailsEnabled ? [Thumbnails] : []),
			...(zoomEnabled ? [Zoom] : [])
		],
		[captionsEnabled, counterEnabled, downloadEnabled, fullscreenEnabled, thumbnailsEnabled, zoomEnabled]
	);
	const resolvedLabels = useMemo(() => resolveImageViewerLabels(labels), [labels]);
	const lightboxProps: LightboxExternalProps = {
		open: open && slides.length > 0,
		close: onClose,
		index: resolvedIndex,
		slides,
		plugins,
		className: cn(styles.viewer, className),
		portal: { container: { style } },
		labels: resolvedLabels,
		carousel: { finite: !loop },
		controller: { closeOnBackdropClick, closeOnPullDown },
		captions: { showToggle: true },
		counter: {
			separator: " / ",
			container: {
				// При captions счётчик занимает отдельную строку и не пересекается с title в левом верхнем углу.
				style: captionsEnabled ? { top: IMAGE_VIEWER_TOP_ROW_HEIGHT } : undefined
			}
		},
		thumbnails: { showToggle: true },
		download: {
			download: ({ slide, saveAs }) => {
				if (!isImageSlide(slide) || slide.download === false) return;

				if (typeof slide.download === "string") {
					saveAs(slide.download);
					return;
				}

				if (typeof slide.download === "object") {
					saveAs(slide.download.url, slide.download.filename);
					return;
				}

				saveAs(slide.src);
			}
		},
		on: {
			view: ({ index: nextIndex }) => {
				if (nextIndex !== resolvedIndex) onIndexChange?.(nextIndex);
			}
		},
		render: {
			iconPrev: () => <ChevronLeftIcon aria-hidden="true" className={styles.icon} />,
			iconNext: () => <ChevronRightIcon aria-hidden="true" className={styles.icon} />,
			iconClose: () => <XIcon aria-hidden="true" className={styles.icon} />,
			iconLoading: () => <LoaderCircleIcon aria-hidden="true" className={cn(styles.icon, styles.loadingIcon)} />,
			iconError: () => <ImageOffIcon aria-hidden="true" className={styles.icon} />,
			iconZoomIn: () => <ZoomInIcon aria-hidden="true" className={styles.icon} />,
			iconZoomOut: () => <ZoomOutIcon aria-hidden="true" className={styles.icon} />,
			iconEnterFullscreen: () => <Maximize2Icon aria-hidden="true" className={styles.icon} />,
			iconExitFullscreen: () => <Minimize2Icon aria-hidden="true" className={styles.icon} />,
			iconThumbnailsVisible: () => <GalleryThumbnailsIcon aria-hidden="true" className={styles.icon} />,
			iconThumbnailsHidden: () => <GalleryThumbnailsIcon aria-hidden="true" className={styles.icon} />,
			iconCaptionsVisible: () => <CaptionsIcon aria-hidden="true" className={styles.icon} />,
			iconCaptionsHidden: () => <CaptionsOffIcon aria-hidden="true" className={styles.icon} />,
			iconDownload: () => <DownloadIcon aria-hidden="true" className={styles.icon} />
		}
	};

	return <Lightbox {...lightboxProps} />;
}
