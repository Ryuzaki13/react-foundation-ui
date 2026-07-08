import { type CSSProperties, type ImgHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";

import { ImagePlaceholder } from "./ImagePlaceholder";

export type ImageSource = {
	srcSet: string;
	type?: string;
	sizes?: string;
};

export interface ImageRendererProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
	src: string;
	sources?: readonly ImageSource[];
	alt?: string;
	role?: string;
	ariaLabel?: string;
	caption?: string;
	fallback?: ReactNode;
	useFigure?: boolean;
	aspectRatio?: string | "unset";
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
	width = "100%",
	height = "100%",
	aspectRatio = "16 / 9",
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

	const sizesAttr = containerWidth ? `${containerWidth}px` : "100vw";
	const defaultFallback = <ImagePlaceholder width={width} height={height} aspectRatio={aspectRatio} />;

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
						onLoad={() => setHasLoaded(true)}
						onError={() => setHasError(true)}
						style={!hasLoaded ? { display: "none" } : { width: "100%", height: "100%", objectFit: "cover", ...style }}
						aria-busy={!hasLoaded}
						width="100%"
						height="100%"
						{...imgProps}
					/>
				</picture>
			)}
			{hasError && defaultFallback}
		</>
	);

	const wrapped = (
		<div ref={wrapperRef} style={{ width, height, aspectRatio, ...wrapperStyle }}>
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
