import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { VideoSlideFrame } from "./VideoSlideFrame";

it.each(["video", "source"])("при ошибке %s убирает плеер и оставляет ссылку на оригинал", (element) => {
	const { container } = render(
		<VideoSlideFrame download={{ url: "/original", filename: "Урок.mp4" }}>
			<video controls>
				<source src="/preview" type="video/mp4" />
			</video>
		</VideoSlideFrame>
	);

	fireEvent.error(container.querySelector(element)!);

	expect(container.querySelector("video")).toBeNull();
	expect(screen.getByRole("alert").textContent).toContain("Не удалось воспроизвести видео");
	expect(screen.getByRole("link", { name: "Скачать оригинал" }).getAttribute("href")).toBe("/original");
});
