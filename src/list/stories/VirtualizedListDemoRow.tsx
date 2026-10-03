import { memo } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { Text } from "../../text";

import { type ListDemoItem } from "./listDemoTypes";

type VirtualizedListDemoRowProps = Readonly<{
	item: ListDemoItem;
	selected: boolean;
	onSelect: (id: string) => void;
}>;

/** Обычная интерактивная строка с переменной высотой и устойчивой identity независимо от её позиции. */
export const VirtualizedListDemoRow = memo(function VirtualizedListDemoRow({ item, selected, onSelect }: VirtualizedListDemoRowProps) {
	return (
		<FlexContainer column gap="sm" className="paddingSm" data-list-demo-item={item.id}>
			<Button type="button" appearance={selected ? "solid" : "ghost"} aria-pressed={selected} onClick={() => onSelect(item.id)}>
				{item.label}
			</Button>
			<Text size="sm" color="secondary">
				Локальная активность: {item.activity}
			</Text>
			{item.paragraphs.map((paragraph, index) => (
				<Text as="p" key={index} size="sm" color="muted">
					{paragraph}
				</Text>
			))}
		</FlexContainer>
	);
});
