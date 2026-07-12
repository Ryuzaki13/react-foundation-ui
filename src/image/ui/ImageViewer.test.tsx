import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type LightboxExternalProps, type Plugin } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import { type ImageViewerImage, type ImageViewerStyle } from "../model/imageViewerTypes";

import { ImageViewer } from "./ImageViewer";

const lightboxMock = vi.hoisted(() => ({ props: undefined as LightboxExternalProps | undefined }));
const pluginMocks = vi.hoisted(() => ({
	captions: (() => undefined) as Plugin,
	counter: (() => undefined) as Plugin,
	download: (() => undefined) as Plugin,
	fullscreen: (() => undefined) as Plugin,
	thumbnails: (() => undefined) as Plugin,
	zoom: (() => undefined) as Plugin
}));

vi.mock("yet-another-react-lightbox", () => ({
	default: (props: LightboxExternalProps) => {
		lightboxMock.props = props;

		return props.open ? (
			<div role="dialog" className={props.className} style={props.portal?.container?.style}>
				<button type="button" onClick={props.close}>
					Закрыть mock
				</button>
				<button type="button" onClick={() => props.on?.view?.({ index: 1 })}>
					Показать второй mock
				</button>
			</div>
		) : null;
	},
	isImageSlide: (slide: { type?: string }) => slide.type === undefined || slide.type === "image"
}));
vi.mock("yet-another-react-lightbox/plugins/captions", () => ({ default: pluginMocks.captions }));
vi.mock("yet-another-react-lightbox/plugins/counter", () => ({ default: pluginMocks.counter }));
vi.mock("yet-another-react-lightbox/plugins/download", () => ({ default: pluginMocks.download }));
vi.mock("yet-another-react-lightbox/plugins/fullscreen", () => ({ default: pluginMocks.fullscreen }));
vi.mock("yet-another-react-lightbox/plugins/thumbnails", () => ({ default: pluginMocks.thumbnails }));
vi.mock("yet-another-react-lightbox/plugins/zoom", () => ({ default: pluginMocks.zoom }));

const IMAGES: readonly ImageViewerImage[] = [
	{ src: "/first.webp", alt: "Первое", intrinsicWidth: 1600, intrinsicHeight: 900 },
	{ src: "/second.webp", alt: "Второе", intrinsicWidth: 1600, intrinsicHeight: 900 }
];

describe("ImageViewer", () => {
	it("передаёт controlled-состояние, русские labels и полный набор включённых plugins", () => {
		const onClose = vi.fn();
		const onIndexChange = vi.fn();
		const style = { "--image-viewer-backdrop": "rebeccapurple" } satisfies ImageViewerStyle;

		render(
			<ImageViewer
				open
				images={IMAGES}
				index={0}
				onClose={onClose}
				onIndexChange={onIndexChange}
				features={{ download: true }}
				labels={{ close: "Закрыть галерею" }}
				className="project-viewer"
				style={style}
			/>
		);

		expect(lightboxMock.props?.plugins).toEqual([Captions, Counter, Download, Fullscreen, Thumbnails, Zoom]);
		expect(lightboxMock.props?.labels?.Close).toBe("Закрыть галерею");
		expect(lightboxMock.props?.labels?.Previous).toBe("Предыдущее изображение");
		expect(lightboxMock.props?.className).toContain("project-viewer");
		expect(lightboxMock.props?.portal?.container?.style).toEqual(style);
		expect(lightboxMock.props?.carousel?.finite).toBe(true);
		expect(lightboxMock.props?.controller?.closeOnBackdropClick).toBe(true);

		fireEvent.click(screen.getByRole("button", { name: "Показать второй mock" }));
		fireEvent.click(screen.getByRole("button", { name: "Закрыть mock" }));

		expect(onIndexChange).toHaveBeenCalledWith(1);
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("не открывает viewer без изображений и ограничивает индекс доступным диапазоном", () => {
		const { rerender } = render(<ImageViewer open images={[]} index={10} onClose={() => undefined} />);

		expect(lightboxMock.props?.open).toBe(false);
		expect(lightboxMock.props?.index).toBe(0);

		rerender(<ImageViewer open images={IMAGES} index={10} onClose={() => undefined} />);

		expect(lightboxMock.props?.open).toBe(true);
		expect(lightboxMock.props?.index).toBe(1);
	});

	it("использует download override изображения и блокирует явно запрещённую загрузку", () => {
		render(
			<ImageViewer
				open
				images={[
					{ ...IMAGES[0], download: { url: "/original.jpg", filename: "photo.jpg" } },
					{ ...IMAGES[1], download: false }
				]}
				features={{ download: true }}
				onClose={() => undefined}
			/>
		);

		const saveAs = vi.fn();
		const download = lightboxMock.props?.download?.download;
		const [allowedSlide, blockedSlide] = lightboxMock.props?.slides ?? [];

		if (!download || !allowedSlide || !blockedSlide) throw new Error("Download contract не передан в lightbox mock.");

		download({ slide: allowedSlide, saveAs });
		download({ slide: blockedSlide, saveAs });

		expect(saveAs).toHaveBeenCalledOnce();
		expect(saveAs).toHaveBeenCalledWith("/original.jpg", "photo.jpg");
	});
});
