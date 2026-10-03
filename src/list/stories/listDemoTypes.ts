export type ListDemoItem = Readonly<{
	id: string;
	label: string;
	paragraphs: readonly string[];
	activity: number;
}>;

export type ListDemoSource = Readonly<{
	items: readonly ListDemoItem[];
	nextId: number;
}>;
