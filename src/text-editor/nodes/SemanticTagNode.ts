import {
	$applyNodeReplacement,
	DOMConversionMap,
	DOMConversionOutput,
	EditorConfig,
	ElementNode,
	LexicalNode,
	LexicalUpdateJSON,
	NodeKey,
	RangeSelection,
	SerializedElementNode,
	Spread
} from "lexical";

export type SemanticTagAttributes = Record<string, string>;

export type SerializedSemanticTagNode = Spread<
	{
		tag: string;
		attributes: SemanticTagAttributes;
		text: null | string;
	},
	SerializedElementNode
>;

const getAttributesFromElement = (element: HTMLElement): SemanticTagAttributes => {
	const attributes: SemanticTagAttributes = {};
	Array.from(element.attributes).forEach((attr) => {
		if (attr.name === "class") return;
		attributes[attr.name] = attr.value;
	});
	return attributes;
};

const convertSemanticTagElement = (domNode: Node): DOMConversionOutput => {
	if (!(domNode instanceof HTMLElement)) {
		return { node: null };
	}

	const tag = domNode.tagName.toLowerCase();
	if (!["abbr", "span", "time", "cite", "del", "ins"].includes(tag)) {
		return { node: null };
	}

	const text = domNode.textContent;
	if ((text === null || text === "") && domNode.children.length === 0) {
		return { node: null };
	}

	return {
		node: $createSemanticTagNode(tag, getAttributesFromElement(domNode), text)
	};
};

export class SemanticTagNode extends ElementNode {
	__tag: string;
	__attributes: SemanticTagAttributes;
	__text: null | string;

	static getType(): string {
		return "semantic-tag";
	}

	static clone(node: SemanticTagNode): SemanticTagNode {
		return new SemanticTagNode(node.__tag, node.__attributes, node.__text, node.__key);
	}

	constructor(tag = "span", attributes: SemanticTagAttributes = {}, text: null | string = null, key?: NodeKey) {
		super(key);
		this.__tag = tag;
		this.__attributes = attributes;
		this.__text = text;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			abbr: () => ({ conversion: convertSemanticTagElement, priority: 2 }),
			span: () => ({ conversion: convertSemanticTagElement, priority: 2 }),
			time: () => ({ conversion: convertSemanticTagElement, priority: 2 }),
			cite: () => ({ conversion: convertSemanticTagElement, priority: 2 }),
			del: () => ({ conversion: convertSemanticTagElement, priority: 2 }),
			ins: () => ({ conversion: convertSemanticTagElement, priority: 2 })
		};
	}

	static importJSON(serializedNode: SerializedSemanticTagNode): SemanticTagNode {
		return $createSemanticTagNode(serializedNode.tag, serializedNode.attributes, serializedNode.text).updateFromJSON(serializedNode);
	}

	updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedSemanticTagNode>): this {
		return super
			.updateFromJSON(serializedNode)
			.setTag(serializedNode.tag)
			.setAttributes(serializedNode.attributes || {})
			.setText(serializedNode.text || null);
	}

	exportJSON(): SerializedSemanticTagNode {
		return {
			...super.exportJSON(),
			type: "semantic-tag",
			version: 1,
			tag: this.getTag(),
			attributes: this.getAttributes(),
			text: this.getText()
		};
	}

	createDOM(config: EditorConfig): HTMLElement {
		void config;
		const element = document.createElement(this.__tag);
		this.applyEditorAttributes(element);
		return element;
	}

	updateDOM(prevNode: this, dom: HTMLElement): boolean {
		if (prevNode.__tag !== this.__tag) {
			return true;
		}

		this.applyEditorAttributes(dom);
		return false;
	}

	exportDOM(): { element: HTMLElement } {
		const element = document.createElement(this.__tag);
		Object.entries(this.__attributes).forEach(([key, value]) => {
			element.setAttribute(key, value);
		});
		return { element };
	}

	applyEditorAttributes(dom: HTMLElement): void {
		dom.classList.add("custom-tag-highlight");
		Array.from(dom.attributes).forEach((attr) => {
			if (attr.name === "class") return;
			dom.removeAttribute(attr.name);
		});
		Object.entries(this.__attributes).forEach(([key, value]) => {
			dom.setAttribute(key, value);
		});
	}

	insertNewAfter(_selection: RangeSelection, restoreSelection = true): null | ElementNode {
		const node = $createSemanticTagNode(this.__tag, this.__attributes, this.__text);
		this.insertAfter(node, restoreSelection);
		return node;
	}

	canInsertTextBefore(): boolean {
		return false;
	}

	canInsertTextAfter(): boolean {
		return false;
	}

	canBeEmpty(): boolean {
		return false;
	}

	isInline(): boolean {
		return true;
	}

	getTag(): string {
		return this.getLatest().__tag;
	}

	setTag(tag: string): this {
		const writable = this.getWritable();
		writable.__tag = tag;
		return this;
	}

	getAttributes(): SemanticTagAttributes {
		return this.getLatest().__attributes;
	}

	setAttributes(attributes: SemanticTagAttributes): this {
		const writable = this.getWritable();
		writable.__attributes = attributes;
		return this;
	}

	getText(): null | string {
		return this.getLatest().__text;
	}

	setText(text: null | string): this {
		const writable = this.getWritable();
		writable.__text = text;
		return this;
	}
}

export const $createSemanticTagNode = (
	tag: string,
	attributes: SemanticTagAttributes = {},
	text: null | string = null
): SemanticTagNode => {
	return $applyNodeReplacement(new SemanticTagNode(tag, attributes, text));
};

export const $isSemanticTagNode = (node: LexicalNode | null | undefined): node is SemanticTagNode => {
	return node instanceof SemanticTagNode;
};
