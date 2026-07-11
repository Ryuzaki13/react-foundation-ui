import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImageRenderer } from "./ImageRenderer";
import { ImageView } from "./ImageView";

describe("ImageRenderer", () => {
	it.each([
		["cover", "cover"],
		["contain", "contain"]
	] as const)("использует fixed-режим %s", async (layout, objectFit) => {
		const { container } = render(<ImageRenderer src="/image.webp" alt="Пример" layout={layout} />);

		await waitFor(() => expect(container.querySelector("img[alt='Пример']")).not.toBeNull());
		const image = container.querySelector("img[alt='Пример']") as HTMLImageElement;

		fireEvent.load(image);

		expect(image.style.width).toBe("100%");
		expect(image.style.height).toBe("100%");
		expect(image.style.objectFit).toBe(objectFit);
	});

	it("сохраняет переопределения style для совместимости fixed-режимов", async () => {
		const { container } = render(
			<ImageRenderer
				src="/image.webp"
				alt="Переопределённый fixed"
				layout="cover"
				height="auto"
				style={{ width: "75%", height: "auto", objectFit: "none" }}
			/>
		);

		await waitFor(() => expect(container.querySelector("img[alt='Переопределённый fixed']")).not.toBeNull());
		const image = container.querySelector("img[alt='Переопределённый fixed']") as HTMLImageElement;

		fireEvent.load(image);

		expect(image.style.width).toBe("75%");
		expect(image.style.height).toBe("auto");
		expect(image.style.objectFit).toBe("none");
		expect((container.firstElementChild as HTMLElement).style.height).toBe("auto");
	});

	it("в intrinsic-режиме сохраняет естественную высоту и не применяет object-fit", async () => {
		const { container } = render(
			<ImageRenderer
				src="/image.webp"
				alt="Полноширинное изображение"
				layout="intrinsic"
				intrinsicWidth={1600}
				intrinsicHeight={900}
				style={{ objectFit: "cover", height: 200 }}
			/>
		);
		await waitFor(() => expect(container.querySelector("img[alt='Полноширинное изображение']")).not.toBeNull());
		const image = container.querySelector("img[alt='Полноширинное изображение']") as HTMLImageElement;
		const placeholder = container.querySelector("svg[aria-label='Изображение недоступно']") as SVGElement;

		expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe("1600 / 900");
		expect(placeholder.getAttribute("height")).toBe("100%");

		fireEvent.load(image);

		expect(image.getAttribute("width")).toBe("1600");
		expect(image.getAttribute("height")).toBe("900");
		expect(image.style.width).toBe("100%");
		expect(image.style.height).toBe("auto");
		expect(image.style.objectFit).toBe("");
		expect((container.firstElementChild as HTMLElement).style.height).toBe("auto");
		expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe("1600 / 900");
	});
});

describe("ImageView", () => {
	it("строит picture из готовых URL без соглашений о хранилище", async () => {
		const { container } = render(
			<ImageView
				image={{
					src: "/original.jpg",
					alt: "Responsive",
					intrinsicWidth: 1280,
					intrinsicHeight: 720,
					candidates: [
						{ src: "/fallback-640.jpg", width: 640 },
						{ src: "/fallback-1280.jpg", width: 1280 }
					],
					sources: [
						{
							type: "image/avif",
							candidates: [
								{ src: "/variant-small.avif", width: 640 },
								{ src: "/variant-large.avif", width: 1280 }
							]
						}
					]
				}}
				sizes="(min-width: 60rem) 60rem, 100vw"
			/>
		);

		await waitFor(() => expect(container.querySelector("picture")).not.toBeNull());

		const source = container.querySelector("source");
		const image = container.querySelector("img[alt='Responsive']") as HTMLImageElement;

		expect(source?.getAttribute("type")).toBe("image/avif");
		expect(source?.getAttribute("srcset")).toBe("/variant-small.avif 640w, /variant-large.avif 1280w");
		expect(source?.getAttribute("sizes")).toBe("(min-width: 60rem) 60rem, 100vw");
		expect(image.getAttribute("srcset")).toBe("/fallback-640.jpg 640w, /fallback-1280.jpg 1280w");
		expect(image.getAttribute("src")).toBe("/original.jpg");
	});
});
