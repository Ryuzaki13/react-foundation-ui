import type { TextEditorBlockStyle } from "../../model/textEditorTypes";

export const getHeadingBlockType = (tag: string): TextEditorBlockStyle => {
	switch (tag) {
		case "h3":
			return "header-three";
		case "h4":
			return "header-four";
		case "h5":
			return "header-five";
		case "h6":
			return "header-six";
		default:
			return "unstyled";
	}
};

export const getHeadingTagByStyle = (style: string): "h3" | "h4" | "h5" | "h6" | null => {
	switch (style) {
		case "header-three":
			return "h3";
		case "header-four":
			return "h4";
		case "header-five":
			return "h5";
		case "header-six":
			return "h6";
		default:
			return null;
	}
};

export const getLexicalInlineStyle = (style: string): string | null => {
	switch (style) {
		case "BOLD":
			return "bold";
		case "ITALIC":
			return "italic";
		case "UNDERLINE":
			return "underline";
		case "STRIKETHROUGH":
			return "strikethrough";
		case "HIGHLIGHT":
			return "highlight";
		case "CODE":
			return "code";
		default:
			return null;
	}
};
