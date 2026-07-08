import { Children, Fragment, ReactElement } from "react";

import { FlexContainer } from "../flex";

import { Badge } from "./Badge";

interface BadgeListProps {
	children: ReactElement<typeof Badge | null | undefined | false>[];
}

/**
 * Контейнер для группы `Badge`, который выстраивает элементы в единый список с предсказуемыми отступами. Используется для компактного вывода набора меток или фильтров.
 */
export function BadgeList({ children }: BadgeListProps) {
	return (
		<FlexContainer inline wrap gap="sm" align="baseline">
			{Children.map(children, (badge, index) => (
				<Fragment key={index}>{badge}</Fragment>
			))}
		</FlexContainer>
	);
}
