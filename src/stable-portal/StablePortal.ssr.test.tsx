// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StablePortal } from "./StablePortal";

describe("StablePortal без DOM", () => {
	it("не создаёт контейнер и возвращает предсказуемый пустой SSR render", () => {
		expect(
			renderToString(
				<StablePortal target={null}>
					<input defaultValue="draft" />
				</StablePortal>
			)
		).toBe("");
	});
});
