import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_TOOLBAR_STATE } from "../model/textEditorTypes";

import { TextEditorToolbarLexical } from "./TextEditorToolbarLexical";
import { LinkTypes } from "./types";

function createToolbarActions() {
	return {
		state: { ...DEFAULT_TOOLBAR_STATE, isTextUnselected: false },
		onBlockStyleToggle: vi.fn(),
		onInlineStyleToggle: vi.fn(),
		onAlignmentChange: vi.fn(),
		onLinkClick: vi.fn(),
		onTagClick: vi.fn(),
		onUndo: vi.fn(),
		onRedo: vi.fn(),
		onCleanTag: vi.fn()
	};
}

/** Проверяем команды, а не подписи кнопок: профиль не меняет контракт локализации панели. */
describe("профиль TextEditorToolbarLexical", () => {
	it("сохраняет прежние группы и очистку тега без новых настроек", () => {
		const actions = createToolbarActions();
		render(<TextEditorToolbarLexical {...actions} toolbarComponents={{ blocks: true, links: true }} />);
		for (const button of screen.getAllByRole("button")) fireEvent.click(button);
		expect(actions.onBlockStyleToggle.mock.calls.map(([style]) => style)).toEqual([
			"unstyled",
			"header-three",
			"header-four",
			"header-five",
			"header-six",
			"ordered-list-item",
			"unordered-list-item",
			"blockquote"
		]);
		expect(actions.onLinkClick.mock.calls.map(([type]) => type)).toEqual([
			LinkTypes.LOCAL_LINK,
			LinkTypes.LINK,
			LinkTypes.PHONE,
			LinkTypes.EMAIL
		]);
		expect(actions.onUndo).toHaveBeenCalledTimes(1);
		expect(actions.onRedo).toHaveBeenCalledTimes(1);
		expect(actions.onCleanTag).toHaveBeenCalledTimes(1);
	});

	it("сужает команды в каноническом порядке без повторов и мутации входных списков", () => {
		const actions = createToolbarActions();
		const blockStyles = Object.freeze(["unordered-list-item", "unstyled", "ordered-list-item", "unstyled"] as const);
		const linkTypes = Object.freeze([LinkTypes.EMAIL, LinkTypes.LINK, LinkTypes.EMAIL]);
		render(
			<TextEditorToolbarLexical
				{...actions}
				toolbarComponents={{ blocks: true, blockStyles, links: true, linkTypes, history: false, clearSemanticTag: false }}
			/>
		);
		for (const button of screen.getAllByRole("button")) fireEvent.click(button);
		expect(actions.onBlockStyleToggle.mock.calls.map(([style]) => style)).toEqual([
			"unstyled",
			"ordered-list-item",
			"unordered-list-item"
		]);
		expect(actions.onLinkClick.mock.calls.map(([type]) => type)).toEqual([LinkTypes.LINK, LinkTypes.EMAIL]);
		expect(actions.onCleanTag).not.toHaveBeenCalled();
		expect(actions.onUndo).not.toHaveBeenCalled();
		expect(blockStyles).toEqual(["unordered-list-item", "unstyled", "ordered-list-item", "unstyled"]);
		expect(linkTypes).toEqual([LinkTypes.EMAIL, LinkTypes.LINK, LinkTypes.EMAIL]);
	});

	it.each([false, undefined])("не включает группы только наличием списков при флаге %s", (enabled) => {
		const actions = createToolbarActions();
		render(
			<TextEditorToolbarLexical
				{...actions}
				toolbarComponents={{
					blocks: enabled,
					blockStyles: ["unstyled"],
					links: enabled,
					linkTypes: [LinkTypes.LINK],
					history: false,
					clearSemanticTag: false
				}}
			/>
		);
		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.queryAllByRole("separator")).toHaveLength(0);
	});

	it("не оставляет кнопки или разделители у явно пустых групп", () => {
		render(
			<TextEditorToolbarLexical
				{...createToolbarActions()}
				toolbarComponents={{ blocks: true, blockStyles: [], links: true, linkTypes: [], history: false, clearSemanticTag: false }}
			/>
		);
		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.queryAllByRole("separator")).toHaveLength(0);
	});

	it("не создаёт команды для стилей, отсутствующих в исходной панели", () => {
		render(
			<TextEditorToolbarLexical
				{...createToolbarActions()}
				toolbarComponents={{
					blocks: true,
					blockStyles: ["header-one", "code-block", "paragraph"],
					history: false,
					clearSemanticTag: false
				}}
			/>
		);
		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.queryAllByRole("separator")).toHaveLength(0);
	});

	it("сохраняет inline и history при пустых списках других групп", () => {
		const actions = createToolbarActions();
		render(
			<TextEditorToolbarLexical
				{...actions}
				toolbarComponents={{ blocks: true, blockStyles: [], links: true, linkTypes: [], inline: true, clearSemanticTag: false }}
			/>
		);
		for (const button of screen.getAllByRole("button")) fireEvent.click(button);
		expect(actions.onInlineStyleToggle.mock.calls.map(([style]) => style)).toEqual([
			"BOLD",
			"ITALIC",
			"UNDERLINE",
			"STRIKETHROUGH",
			"HIGHLIGHT",
			"CODE"
		]);
		expect(actions.onBlockStyleToggle).not.toHaveBeenCalled();
		expect(actions.onLinkClick).not.toHaveBeenCalled();
		expect(actions.onUndo).toHaveBeenCalledTimes(1);
		expect(actions.onRedo).toHaveBeenCalledTimes(1);
	});

	it("сохраняет disabled-поведение inline, внешних ссылок и очистки без выделения", () => {
		const actions = createToolbarActions();
		render(
			<TextEditorToolbarLexical
				{...actions}
				state={DEFAULT_TOOLBAR_STATE}
				toolbarComponents={{
					inline: true,
					links: true,
					linkTypes: [LinkTypes.LINK, LinkTypes.PHONE, LinkTypes.EMAIL],
					history: false
				}}
			/>
		);
		for (const button of screen.getAllByRole("button")) {
			expect(button).toHaveProperty("disabled", true);
			fireEvent.click(button);
		}
		expect(actions.onInlineStyleToggle).not.toHaveBeenCalled();
		expect(actions.onLinkClick).not.toHaveBeenCalled();
		expect(actions.onCleanTag).not.toHaveBeenCalled();
	});

	it("сохраняет очистку тега при явно переданном undefined", () => {
		const actions = createToolbarActions();
		render(<TextEditorToolbarLexical {...actions} toolbarComponents={{ history: false, clearSemanticTag: undefined }} />);
		fireEvent.click(screen.getByRole("button"));
		expect(actions.onCleanTag).toHaveBeenCalledTimes(1);
	});
});
