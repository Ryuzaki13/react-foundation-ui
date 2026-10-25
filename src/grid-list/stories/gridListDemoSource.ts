/** Данные стенда остаются у consumer: сетка получает только доступный readonly источник. */
export type GridListDemoItem = {
	readonly id: string;
	readonly label: string;
	readonly category: string;
	readonly paragraphs: readonly string[];
};

export type GridListDemoMode = "full" | "grouped" | "paginated";

/** Разная высота карточек позволяет проверить измерение максимума каждого адаптивного ряда. */
export function createGridListDemoItems(count: number, offset = 0): readonly GridListDemoItem[] {
	return Array.from({ length: count }, (_, index) => {
		const number = offset + index;
		return {
			id: `card-${number}`,
			label: `Материал ${number + 1}`,
			category: number % 3 === 0 ? "Учебные материалы" : number % 3 === 1 ? "Отчёты" : "Изображения",
			paragraphs: Array.from(
				{ length: (number % 3) + 1 },
				(_, paragraph) =>
					`Сведения ${paragraph + 1}. Содержимое переносится по доступной ширине и определяет фактическую высоту карточки.`
			)
		};
	});
}
