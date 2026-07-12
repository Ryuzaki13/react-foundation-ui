// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ImageViewer } from "./ImageViewer";

describe("ImageViewer SSR", () => {
	it("не обращается к browser globals во время server render", () => {
		const html = renderToString(
			<ImageViewer
				open
				images={[{ src: "/image.webp", alt: "SSR изображение", intrinsicWidth: 1600, intrinsicHeight: 900 }]}
				onClose={() => undefined}
			/>
		);

		expect(html).toBe("");
	});
});
