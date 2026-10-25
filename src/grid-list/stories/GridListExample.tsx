import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";
import { Text } from "../../text";
import { GridList } from "../index";

import { GridListDemoCard } from "./GridListDemoCard";
import { gridListDemoGrouping } from "./gridListDemoGrouping";
import { type GridListDemoMode } from "./gridListDemoSource";
import { useGridListExample } from "./useGridListExample";

type GridListExampleProps = {
	readonly mode?: GridListDemoMode;
};

/** Один стенд проверяет общий reflow, изменяемую высоту и непрерывное дополнение постраничного источника. */
export function GridListExample({ mode = "full" }: GridListExampleProps) {
	const example = useGridListExample(mode);
	return (
		<div
			style={{ height: "min(80dvh, 48rem)", minHeight: "32rem", width: example.narrow ? "min(100%, 36rem)" : "100%" }}
			data-grid-demo-source-count={example.sourceCount}>
			<GridList>
				<GridList.Toolbar>
					<FlexContainer column gap="sm" className="paddingSm">
						<InputText
							type="search"
							label="Поиск по локальному набору"
							value={example.search}
							onChange={example.changeSearch}
							data-grid-demo-action="search"
						/>
						<FlexContainer wrap gap="sm">
							<Button onClick={example.prepend} data-grid-demo-action="prepend">
								Добавить в начало
							</Button>
							<Button onClick={example.reverse} data-grid-demo-action="reverse">
								Обратить порядок
							</Button>
							<Button onClick={example.growSelected} data-grid-demo-action="grow">
								Увеличить выбранную карточку
							</Button>
							<Button onClick={example.toggleDensity} aria-pressed={example.compact} data-grid-demo-action="density">
								Плотная сетка
							</Button>
							<Button onClick={example.toggleWidth} aria-pressed={example.narrow} data-grid-demo-action="width">
								Узкий контейнер
							</Button>
							<Button onClick={example.resetPosition} data-grid-demo-action="reset">
								К началу
							</Button>
						</FlexContainer>
					</FlexContainer>
				</GridList.Toolbar>
				<GridList.Content
					items={example.items}
					getKey={example.getKey}
					render={(item) => (
						<GridListDemoCard item={item} selected={item.id === example.selectedId} onSelect={example.setSelectedId} />
					)}
					minItemWidth={example.compact ? "12rem" : "var(--grid-demo-min-width, 18rem)"}
					maxColumns={4}
					gap="md"
					grouping={mode === "grouped" ? gridListDemoGrouping : undefined}
					estimateSize={320}
					overscan={2}
					resetKey={example.resetKey}
					onVisibleKeysChange={example.onVisibleKeysChange}
					hasNextPage={example.hasNextPage}
					fetchNextPage={example.fetchNextPage}
					emptyContent={<Text as="p">Поиск не нашёл материалов.</Text>}
					aria-label="Материалы в адаптивной сетке"
				/>
				<GridList.Footer>
					<FlexContainer column gap="xs" className="paddingSm">
						<Text size="sm">
							Доступно {example.items.length} из {example.sourceCount}; выбран {example.selectedId ?? "ни один"}.
						</Text>
						<Text size="sm" data-grid-demo-visible-keys={example.visibleKeys.join(",")}>
							В видимых рядах: {example.visibleKeys.length} карточек.
						</Text>
					</FlexContainer>
				</GridList.Footer>
			</GridList>
		</div>
	);
}
