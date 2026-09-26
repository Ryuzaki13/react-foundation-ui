import { getTextEditorViewerElementStyle } from "../../lib/viewer/getTextEditorViewerElementStyle";
import { type TextEditorViewerNode as TextEditorViewerNodeModel } from "../../model/textEditorViewerTypes";

import { TextEditorViewerText } from "./TextEditorViewerText";

export type TextEditorViewerNodeProps = Readonly<{ node: TextEditorViewerNodeModel }>;

/** Все tags и DOM props заданы renderer: исходные attributes не распространяются в JSX. */
export function TextEditorViewerNode({ node }: TextEditorViewerNodeProps) {
	if (node.type === "text") return <TextEditorViewerText node={node} />;
	if (node.type === "linebreak") return <br />;
	const children = node.children.map((child, index) => <TextEditorViewerNode key={index} node={child} />);
	const elementProps = { dir: node.direction ?? undefined, style: getTextEditorViewerElementStyle(node) };
	switch (node.type) {
		case "paragraph":
			return <p {...elementProps}>{children.length ? children : <br />}</p>;
		case "quote":
			return <blockquote {...elementProps}>{children}</blockquote>;
		case "heading": {
			const Heading = node.tag;
			return <Heading {...elementProps}>{children}</Heading>;
		}
		case "link":
			return (
				<a
					{...elementProps}
					href={node.url}
					target={node.target}
					rel={node.target === "_blank" ? "noopener noreferrer" : undefined}
					aria-label={node.ariaLabel ?? undefined}
					title={node.title ?? undefined}>
					{children}
				</a>
			);
		case "list":
			return node.listType === "number" ? (
				<ol {...elementProps} start={node.start}>
					{children}
				</ol>
			) : (
				<ul {...elementProps}>{children}</ul>
			);
		case "listitem":
			return (
				<li
					{...elementProps}
					value={node.value}
					data-nested-list={node.children.length === 1 && node.children[0]?.type === "list" ? "true" : undefined}>
					{children}
				</li>
			);
	}
}
