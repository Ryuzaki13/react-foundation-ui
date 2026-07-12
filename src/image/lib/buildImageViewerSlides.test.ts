import { describe, expect, it } from "vitest";

import { type ImageViewerImage } from "../model/imageViewerTypes";

import { buildImageViewerSlides } from "./buildImageViewerSlides";

describe("buildImageViewerSlides", () => {
	it("строит упорядоченный YARL srcSet и вычисляет высоту width/density кандидатов", () => {
		const images: readonly ImageViewerImage[] = [
			{
				src: "/primary.webp",
				alt: "Пейзаж",
				intrinsicWidth: 1600,
				intrinsicHeight: 900,
				candidates: [
					{ src: "/1280.webp", width: 1280 },
					{ src: "/640.webp", width: 640 },
					{ src: "/duplicate-640.webp", width: 640 },
					{ src: "/retina.webp", density: 2 }
				],
				thumbnail: "/thumb.webp",
				download: { url: "/original.jpg", filename: "original.jpg" }
			}
		];

		expect(buildImageViewerSlides(images)).toEqual([
			{
				src: "/primary.webp",
				alt: "Пейзаж",
				width: 1600,
				height: 900,
				srcSet: [
					{ src: "/640.webp", width: 640, height: 360 },
					{ src: "/1280.webp", width: 1280, height: 720 },
					{ src: "/retina.webp", width: 3200, height: 1800 }
				],
				title: "Пейзаж",
				description: undefined,
				thumbnail: "/thumb.webp",
				download: { url: "/original.jpg", filename: "original.jpg" }
			}
		]);
	});

	it("не создаёт responsive srcSet без полной intrinsic-геометрии и сохраняет явный null title", () => {
		const [slide] = buildImageViewerSlides([
			{
				src: "/image.webp",
				alt: "Скрытая подпись",
				intrinsicWidth: 1200,
				candidates: [{ src: "/image-600.webp", width: 600 }],
				sources: [{ type: "image/avif", candidates: [{ src: "/image.avif", width: 1200 }] }],
				title: null,
				download: false
			}
		]);

		expect(slide).toEqual({
			src: "/image.webp",
			alt: "Скрытая подпись",
			width: undefined,
			height: undefined,
			srcSet: undefined,
			title: null,
			description: undefined,
			thumbnail: undefined,
			download: false
		});
		expect(slide).not.toHaveProperty("sources");
	});
});
