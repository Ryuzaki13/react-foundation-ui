import { Button } from "../button";
import { FlexContainer } from "../flex";
import { Text } from "../text";
import { UI_APPEARANCE_SOLID, UI_TONE_ACCENT, UI_TONE_NEUTRAL } from "../uiSchemeConstants";

import { createPaginationModel } from "./lib/createPaginationModel";
import { PAGINATION_ITEM_KIND_GAP } from "./lib/paginationConstants";
import styles from "./Pagination.module.scss";
import { type PaginationProps } from "./PaginationProps";

/** Общая навигация страниц не знает о запросах, файлах и способе хранения состояния. */
export function Pagination({
	page,
	pageCount,
	onPageChange,
	disabled = false,
	"aria-label": ariaLabel = "Страницы",
	buttonAppearance,
	...props
}: PaginationProps) {
	const model = createPaginationModel(page, pageCount);

	if (pageCount <= 1) {
		return null;
	}

	return (
		<FlexContainer {...props} as="nav" wrap gap="xs" align="center" aria-label={ariaLabel} data-ui="pagination">
			<Button
				appearance={buttonAppearance}
				data-action="pagination-previous"
				aria-label="Предыдущая страница"
				disabled={disabled || model.page === 1}
				onClick={() => onPageChange(model.page - 1)}>
				Назад
			</Button>

			{model.items.map((item) => {
				if (item.kind === PAGINATION_ITEM_KIND_GAP) {
					return (
						<Text key={`gap-${item.position}`} color="muted" className={styles.gap} aria-hidden="true" data-ui="pagination-gap">
							...
						</Text>
					);
				}

				const selected = item.page === model.page;

				return (
					<Button
						key={item.page}
						data-page={item.page}
						aria-label={`Страница ${item.page}`}
						aria-current={selected ? "page" : undefined}
						appearance={selected ? UI_APPEARANCE_SOLID : buttonAppearance}
						tone={selected ? UI_TONE_ACCENT : UI_TONE_NEUTRAL}
						disabled={disabled}
						onClick={() => {
							if (!selected) {
								onPageChange(item.page);
							}
						}}>
						{item.page}
					</Button>
				);
			})}

			<Button
				appearance={buttonAppearance}
				data-action="pagination-next"
				aria-label="Следующая страница"
				disabled={disabled || model.page === pageCount}
				onClick={() => onPageChange(model.page + 1)}>
				Вперёд
			</Button>
		</FlexContainer>
	);
}
