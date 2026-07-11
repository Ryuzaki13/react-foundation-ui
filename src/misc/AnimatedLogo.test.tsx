import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedLogo } from "./AnimatedLogo";
import { AnimatedLogoSegment } from "./AnimatedLogoSegment";
import { LoadingMessage } from "./LoadingMessage";

describe("AnimatedLogo", () => {
	it("анимирует переданную host-проектом SVG-разметку без встроенного брендового знака", () => {
		render(
			<AnimatedLogo className="host-logo" data-testid="animated-logo">
				<svg data-testid="host-svg" viewBox="0 0 10 10">
					<AnimatedLogoSegment order={2} data-testid="animated-segment">
						<path data-testid="host-path" d="M0 0h10v10H0z" />
					</AnimatedLogoSegment>
				</svg>
			</AnimatedLogo>
		);

		const logo = screen.getByTestId("animated-logo");
		const segment = screen.getByTestId("animated-segment");

		expect(logo.classList.contains("host-logo")).toBe(true);
		expect(screen.getByTestId("host-svg").querySelectorAll("path")).toHaveLength(1);
		expect(screen.getByTestId("host-path").getAttribute("d")).toBe("M0 0h10v10H0z");
		expect(segment.tagName).toBe("g");
		expect(segment.style.animationDelay).toBe("400ms");
	});
});

describe("LoadingMessage", () => {
	it("показывает переданный host-проектом логотип", () => {
		render(<LoadingMessage logo={<span data-testid="host-loading-logo">KTK</span>} />);

		expect(screen.getByTestId("host-loading-logo").textContent).toBe("KTK");
		expect(screen.getByText("Загрузка...")).toBeTruthy();
	});
});
