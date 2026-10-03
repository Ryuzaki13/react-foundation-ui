import { type ListDemoItem } from "./listDemoTypes";

/** Разная длина локального содержимого показывает реальные измерения, а не подогнанную высоту строки. */
export function createListDemoItems(count: number): readonly ListDemoItem[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `entry-${index}`,
		label: `Запись ${index + 1}`,
		activity: 0,
		paragraphs: Array.from(
			{ length: (index % 3) + 1 },
			(_, paragraph) =>
				`Дополнительные сведения ${paragraph + 1}. Длинное содержимое свободно переносится на узком экране и меняет измеренную высоту записи.`
		)
	}));
}
