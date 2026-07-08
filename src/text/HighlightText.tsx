export const HighlightText = ({ text, highlight }: { text: string; highlight?: string }) => {
	if (!highlight) return text;
	return text
		.split(new RegExp(`(${highlight})`, "gi"))
		.map((part, i) => (part.toLowerCase() === highlight.toLowerCase() ? <mark key={i}>{part}</mark> : part));
};
