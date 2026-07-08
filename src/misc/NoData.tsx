import { Message } from "./Message";

interface NoDataProps {
	className?: string;
	text?: string;
	minHeight?: string | number;
}

export const NoData = ({ className, text, minHeight = "5em" }: NoDataProps) => {
	return (
		<Message className={className} color="muted" minHeight={minHeight}>
			{text || "Нет данных"}
		</Message>
	);
};
