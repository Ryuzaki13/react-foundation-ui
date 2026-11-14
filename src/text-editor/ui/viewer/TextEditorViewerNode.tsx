import { getTextEditorViewerElementStyle } from "../../lib/viewer/getTextEditorViewerElementStyle";
import {
	LEXICAL_NODE_TYPE_TEXT,
	LEXICAL_NODE_TYPE_LINEBREAK,
	LEXICAL_NODE_TYPE_PARAGRAPH,
	LEXICAL_NODE_TYPE_QUOTE,
	LEXICAL_NODE_TYPE_HEADING,
	LEXICAL_NODE_TYPE_LINK,
	LEXICAL_NODE_TYPE_LIST,
	LEXICAL_LIST_TYPE_NUMBER,
	LEXICAL_NODE_TYPE_LISTITEM
} from "../../model/textEditorLexicalNodeConstants";
import { TEXT_EDITOR_LINK_TARGET_BLANK, TEXT_EDITOR_EXTERNAL_LINK_REL } from "../../model/textEditorLinkConstants";
import { type TextEditorViewerNode as TextEditorViewerNodeModel } from "../../model/textEditorViewerTypes";

import { TextEditorViewerText } from "./TextEditorViewerText";

export type TextEditorViewerNodeProps = Readonly<{ node: TextEditorViewerNodeModel }>;

/** Все tags и DOM props заданы renderer: исходные attributes не распространяются в JSX. */
export function TextEditorViewerNode({ node }: TextEditorViewerNodeProps) {
	if (node.type === LEXICAL_NODE_TYPE_TEXT) return <TextEditorViewerText node={node} />;
	if (node.type === LEXICAL_NODE_TYPE_LINEBREAK) return <br />;
	const children = node.children.map((child, index) => <TextEditorViewerNode key={index} node={child} />);
	const elementProps = { dir: node.direction ?? undefined, style: getTextEditorViewerElementStyle(node) };
	switch (node.type) {
		case LEXICAL_NODE_TYPE_PARAGRAPH:
			return <p {...elementProps}>{children.length ? children : <br />}</p>;
		case LEXICAL_NODE_TYPE_QUOTE:
			return <blockquote {...elementProps}>{children}</blockquote>;
		case LEXICAL_NODE_TYPE_HEADING: {
			const Heading = node.tag;
			return <Heading {...elementProps}>{children}</Heading>;
		}
		case LEXICAL_NODE_TYPE_LINK:
			return (
				<a
					{...elementProps}
					href={node.url}
					target={node.target}
					rel={node.target === TEXT_EDITOR_LINK_TARGET_BLANK ? TEXT_EDITOR_EXTERNAL_LINK_REL : undefined}
					aria-label={node.ariaLabel ?? undefined}
					title={node.title ?? undefined}>
					{children}
				</a>
			);
		case LEXICAL_NODE_TYPE_LIST:
			return node.listType === LEXICAL_LIST_TYPE_NUMBER ? (
				<ol {...elementProps} start={node.start}>
					{children}
				</ol>
			) : (
				<ul {...elementProps}>{children}</ul>
			);
		case LEXICAL_NODE_TYPE_LISTITEM:
			return (
				<li
					{...elementProps}
					value={node.value}
					data-nested-list={node.children.length === 1 && node.children[0]?.type === LEXICAL_NODE_TYPE_LIST ? "true" : undefined}>
					{children}
				</li>
			);
	}
}
