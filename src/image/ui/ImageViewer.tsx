import { lazy, Suspense, useCallback, useState } from "react";

import { type ImageViewerProps } from "../model/imageViewerTypes";

import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

const LazyImageViewerRuntime = lazy(() => import("./ImageViewerRuntime"));

/**
 * Управляемый полноэкранный viewer с ленивой границей vendor runtime.
 * YARL и его плагины загружаются только при первом открытии, а после mount runtime остаётся в React-дереве,
 * чтобы закрытие успело завершить анимацию, снять inert и вернуть focus исходному trigger.
 */
export function ImageViewer(props: ImageViewerProps) {
	const [runtimeMounted, setRuntimeMounted] = useState(false);
	const handleRuntimeMounted = useCallback(() => setRuntimeMounted(true), []);
	const canRenderRuntime = typeof document !== "undefined" && (props.open || runtimeMounted);

	if (!canRenderRuntime) return null;

	return (
		<Suspense fallback={null}>
			<LazyImageViewerRuntime {...props} onRuntimeMounted={handleRuntimeMounted} />
		</Suspense>
	);
}
