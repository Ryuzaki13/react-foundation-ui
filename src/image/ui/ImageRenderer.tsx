import { type CSSProperties, type ImgHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";

import { type ImageLayout, type ImageSource } from "../model/imageTypes";

import { ImagePlaceholder } from "./ImagePlaceholder";

export interface ImageRendererProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
	src: string;
	sources?: readonly ImageSource[];
	layout?: ImageLayout;
	alt?: string;
	role?: string;
	ariaLabel?: string;
	caption?: string;
	fallback?: ReactNode;
	useFigure?: boolean;
	aspectRatio?: string | "unset";
	width?: CSSProperties["width"];
	height?: CSSProperties["height"];
	intrinsicWidth?: number;
	intrinsicHeight?: number;
	wrapperStyle?: CSSProperties;
}

/**
 * Базовый рендер изображения: lazy-появление, placeholder, обработка ошибки и figure/caption.
 * Компонент не знает, как устроено хранилище и какие форматы/размеры доступны.
 */
export function ImageRenderer({
	src,
	sources,
	alt,
	role,
	ariaLabel,
	caption,
	fallback,
	useFigure = false,
	layout = "cover",
	width = "100%",
	height = "100%",
	aspectRatio,
	intrinsicWidth,
	intrinsicHeight,
	onLoad,
	onError,
	style,
	wrapperStyle,
	...imgProps
}: ImageRendererProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") {
			// Отложенный fallback сохраняет одинаковый первый render на сервере и в браузере без IntersectionObserver.
			const timeoutId = window.setTimeout(() => setIsVisible(true), 0);

			return () => window.clearTimeout(timeoutId);
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					const parentWidth = Math.round(entry.boundingClientRect.width);

					setContainerWidth(parentWidth);
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "100px", threshold: 0.01 }
		);

		if (wrapperRef.current) {
			observer.observe(wrapperRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const isIntrinsic = layout === "intrinsic";
	const resolvedHeight = isIntrinsic ? "auto" : height;
	const intrinsicAspectRatio = intrinsicWidth && intrinsicHeight ? `${intrinsicWidth} / ${intrinsicHeight}` : undefined;
	const resolvedAspectRatio = isIntrinsic ? (intrinsicAspectRatio ?? aspectRatio ?? "auto") : (aspectRatio ?? "16 / 9");
	const placeholderHeight = isIntrinsic && resolvedAspectRatio !== "auto" && resolvedAspectRatio !== "unset" ? "100%" : resolvedHeight;
	const sizesAttr = containerWidth ? `${containerWidth}px` : "100vw";
	const defaultFallback = <ImagePlaceholder width={width} height={placeholderHeight} aspectRatio={resolvedAspectRatio} />;
	const loadedImageStyle: CSSProperties = isIntrinsic
		? {
				...style,
				display: "block",
				width: "100%",
				height: "auto",
				objectFit: undefined
			}
		: {
				display: "block",
				width: "100%",
				height: "100%",
				objectFit: layout,
				...style
			};

	const content = (
		<>
			{!hasLoaded && !hasError && (fallback || defaultFallback)}
			{isVisible && !hasError && (
				<picture>
					{sources?.map((source) => (
						<source
							key={`${source.type ?? "source"}-${source.srcSet}`}
							srcSet={source.srcSet}
							type={source.type}
							sizes={source.sizes ?? sizesAttr}
						/>
					))}
					<img
						src={src}
						alt={alt}
						role={role}
						aria-label={ariaLabel}
						onLoad={(event) => {
							setHasLoaded(true);
							onLoad?.(event);
						}}
						onError={(event) => {
							setHasError(true);
							onError?.(event);
						}}
						style={!hasLoaded ? { display: "none" } : loadedImageStyle}
						aria-busy={!hasLoaded}
						width={intrinsicWidth}
						height={intrinsicHeight}
						{...imgProps}
					/>
				</picture>
			)}
			{hasError && defaultFallback}
		</>
	);

	const wrapped = (
		<div ref={wrapperRef} style={{ width, height: resolvedHeight, aspectRatio: resolvedAspectRatio, ...wrapperStyle }}>
			{content}
		</div>
	);

	return useFigure ? (
		<figure className="relative">
			{wrapped}
			{caption && (
				<figcaption
					style={{ bottom: 2, right: 2, maxWidth: "calc(100% - 4px)" }}
					className="absolute paddingInlineMd textRight radiusSm fontSizeSm">
					{caption}
				</figcaption>
			)}
		</figure>
	) : (
		wrapped
	);
}
