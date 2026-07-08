import { LinkAttributes, LinkNode, SerializedLinkNode } from "@lexical/link";
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
	Spread
} from "lexical";

export type AccessibleLinkAttributes = LinkAttributes & {
	ariaLabel?: null | string;
	qrCode?: boolean;
	add?: null | string;
	text?: null | string;
};

export type SerializedAccessibleLinkNode = Spread<
	{
		ariaLabel: null | string;
		qrCode: boolean;
		add: null | string;
		text: null | string;
	},
	SerializedLinkNode
>;

const convertAccessibleLinkElement = (domNode: Node): DOMConversionOutput => {
	if (!(domNode instanceof HTMLAnchorElement)) {
		return { node: null };
	}

	const textContent = domNode.textContent;
	if ((textContent === null || textContent === "") && domNode.children.length === 0) {
		return { node: null };
	}

	return {
		node: $createAccessibleLinkNode(domNode.getAttribute("href") || "", {
			rel: domNode.getAttribute("rel"),
			target: domNode.getAttribute("target"),
			title: domNode.getAttribute("title"),
			ariaLabel: domNode.getAttribute("aria-label"),
			qrCode: domNode.getAttribute("data-qr-code") === "true",
			add: null,
			text: textContent
		})
	};
};

export class AccessibleLinkNode extends LinkNode {
	__ariaLabel: null | string;
	__qrCode: boolean;
	__add: null | string;
	__text: null | string;

	static getType(): string {
		return "accessible-link";
	}

	static clone(node: AccessibleLinkNode): AccessibleLinkNode {
		return new AccessibleLinkNode(
			node.__url,
			{
				rel: node.__rel,
				target: node.__target,
				title: node.__title,
				ariaLabel: node.__ariaLabel,
				qrCode: node.__qrCode,
				add: node.__add,
				text: node.__text
			},
			node.__key
		);
	}

	constructor(url = "", attributes: AccessibleLinkAttributes = {}, key?: NodeKey) {
		super(url, attributes, key);

		const { ariaLabel = null, qrCode = false, add = null, text = null } = attributes;
		this.__ariaLabel = ariaLabel;
		this.__qrCode = qrCode;
		this.__add = add;
		this.__text = text;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			a: () => ({
				conversion: convertAccessibleLinkElement,
				priority: 2
			})
		};
	}

	static importJSON(serializedNode: SerializedAccessibleLinkNode): AccessibleLinkNode {
		return $createAccessibleLinkNode().updateFromJSON(serializedNode);
	}

	updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedAccessibleLinkNode>): this {
		return super
			.updateFromJSON(serializedNode)
			.setAriaLabel(serializedNode.ariaLabel || null)
			.setQrCode(!!serializedNode.qrCode)
			.setAdd(serializedNode.add || null)
			.setText(serializedNode.text || null);
	}

	exportJSON(): SerializedAccessibleLinkNode {
		return {
			...super.exportJSON(),
			type: "accessible-link",
			version: 1,
			ariaLabel: this.getAriaLabel(),
			qrCode: this.getQrCode(),
			add: this.getAdd(),
			text: this.getText()
		} as SerializedAccessibleLinkNode;
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config) as HTMLElement;
		this.applyAccessibleAttributes(null, dom);
		return dom;
	}

	updateDOM(prevNode: this, anchor: HTMLElement, config: EditorConfig): boolean {
		const isUpdated = super.updateDOM(prevNode, anchor as never, config);
		this.applyAccessibleAttributes(prevNode, anchor);
		return isUpdated;
	}

	applyAccessibleAttributes(prevNode: this | null, anchor: HTMLElement): void {
		if (!(anchor instanceof HTMLAnchorElement)) {
			return;
		}

		if (!prevNode || prevNode.__ariaLabel !== this.__ariaLabel) {
			if (this.__ariaLabel) {
				anchor.setAttribute("aria-label", this.__ariaLabel);
			} else {
				anchor.removeAttribute("aria-label");
			}
		}

		if (!prevNode || prevNode.__qrCode !== this.__qrCode) {
			anchor.setAttribute("data-qr-code", this.__qrCode ? "true" : "false");
		}
	}

	insertNewAfter(_selection: RangeSelection, restoreSelection = true): null | ElementNode {
		const linkNode = $createAccessibleLinkNode(this.__url, {
			rel: this.__rel,
			target: this.__target,
			title: this.__title,
			ariaLabel: this.__ariaLabel,
			qrCode: this.__qrCode,
			add: this.__add,
			text: this.__text
		});
		this.insertAfter(linkNode, restoreSelection);
		return linkNode;
	}

	getAriaLabel(): null | string {
		return this.getLatest().__ariaLabel;
	}

	setAriaLabel(ariaLabel: null | string): this {
		const writable = this.getWritable();
		writable.__ariaLabel = ariaLabel;
		return this;
	}

	getQrCode(): boolean {
		return this.getLatest().__qrCode;
	}

	setQrCode(qrCode: boolean): this {
		const writable = this.getWritable();
		writable.__qrCode = qrCode;
		return this;
	}

	getAdd(): null | string {
		return this.getLatest().__add;
	}

	setAdd(add: null | string): this {
		const writable = this.getWritable();
		writable.__add = add;
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

export const $createAccessibleLinkNode = (url = "", attributes?: AccessibleLinkAttributes): AccessibleLinkNode => {
	return $applyNodeReplacement(new AccessibleLinkNode(url, attributes));
};

export const $isAccessibleLinkNode = (node: LexicalNode | null | undefined): node is AccessibleLinkNode => {
	return node instanceof AccessibleLinkNode;
};
