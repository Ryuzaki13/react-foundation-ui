// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AnalyticalTable } from "./AnalyticalTable";
import { testColumns, testSnapshot } from "./test-fixtures/analyticalTableTestData";

describe("AnalyticalTable browser-free SSR", () => {
	it("импортируется и рендерит окно без window, document и observer globals", () => {
		expect(typeof window).toBe("undefined");
		expect(typeof document).toBe("undefined");
		const html = renderToString(<AnalyticalTable snapshot={testSnapshot} columns={testColumns} />);
		expect(html).toContain("Альфа");
		expect(html).toContain("30 руб.");
		expect(html).not.toContain("Деталь");
	});
});
