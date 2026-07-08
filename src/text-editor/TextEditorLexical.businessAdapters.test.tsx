// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextEditorLexicalClient as TextEditorLexical } from "./TextEditorLexicalClient";

import type { LocalLinkDialogAdapterProps } from "./editorModel";

function LocalLinkDialogStub({ isOpen }: LocalLinkDialogAdapterProps) {
	if (!isOpen) return null;

	return <div data-testid="local-link-adapter">local-link-open</div>;
}

describe("TextEditorLexical businessAdapters", () => {
	it("открывает LocalLink адаптер по кнопке локальной ссылки", async () => {
		render(
			<TextEditorLexical
				initialData={{ html: "", raw: {} }}
				onChange={vi.fn()}
				toolbarComponents={{ links: true }}
				businessAdapters={{ LocalLinkDialogComponent: LocalLinkDialogStub }}
			/>
		);

		const localLinkButton = screen.getByRole("button", { name: "Добавить ссылку на статью" });
		fireEvent.mouseDown(localLinkButton);

		await waitFor(() => {
			expect(screen.queryByTestId("local-link-adapter")).not.toBeNull();
		});
	});

	it("не падает без businessAdapters при клике на локальную ссылку", () => {
		render(<TextEditorLexical initialData={{ html: "", raw: {} }} onChange={vi.fn()} toolbarComponents={{ links: true }} />);

		const localLinkButton = screen.getByRole("button", { name: "Добавить ссылку на статью" });
		fireEvent.mouseDown(localLinkButton);

		expect(screen.queryByTestId("local-link-adapter")).toBeNull();
	});
});
