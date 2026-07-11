import { describe, expect, it } from "vitest";

import { buildImageSources } from "./buildImageSources";
import { buildImageSrcSet } from "./buildImageSrcSet";

describe("buildImageSrcSet", () => {
	it("собирает варианты с дескрипторами ширины", () => {
		expect(
			buildImageSrcSet([
				{ src: "/image-320.webp", width: 320 },
				{ src: "/image-1280.webp", width: 1280 }
			])
		).toBe("/image-320.webp 320w, /image-1280.webp 1280w");
	});

	it("собирает варианты с дескрипторами плотности", () => {
		expect(
			buildImageSrcSet([
				{ src: "/image.webp", density: 1 },
				{ src: "/image@2x.webp", density: 2 }
			])
		).toBe("/image.webp 1x, /image@2x.webp 2x");
	});
});

describe("buildImageSources", () => {
	it("применяет общие sizes и не возвращает пустые source", () => {
		expect(
			buildImageSources(
				[
					{ type: "image/avif", candidates: [{ src: "/image-640.avif", width: 640 }] },
					{ type: "image/webp", candidates: [] }
				],
				"(min-width: 60rem) 60rem, 100vw"
			)
		).toEqual([
			{
				type: "image/avif",
				srcSet: "/image-640.avif 640w",
				sizes: "(min-width: 60rem) 60rem, 100vw"
			}
		]);
	});
});
