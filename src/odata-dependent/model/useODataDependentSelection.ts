import { useCallback, useState } from "react";

/**
 * Единый массивный формат значений зависимых OData-сегментов.
 *
 * Даже single-select хранит значение как массив из нуля или одного элемента:
 * это позволяет без преобразований передавать весь снимок в `dependencies`
 * OData-контролов и использовать один state-контракт для разных видов выбора.
 */
export type ODataDependentSelectionValues = Record<string, string[]>;

export type ODataDependentSelectionMode = "independent" | "sequential";

type ODataDependentSelectionCommonOptions = {
	/** Внешний снимок значений. При наличии включает controlled-режим. */
	values?: ODataDependentSelectionValues;
	/** Начальный снимок для uncontrolled-режима. */
	defaultValues?: ODataDependentSelectionValues;
	/** Получает полный снимок после каждого изменения сегмента. */
	onChange?: (values: ODataDependentSelectionValues) => void;
};

type IndependentSelectionOptions = {
	/** Каждый сегмент доступен независимо от заполненности предыдущих. */
	selectionMode?: "independent";
	/** Порядок может передаваться общей композицией, но в этом режиме не ограничивает выбор. */
	segmentOrder?: readonly string[];
};

type SequentialSelectionOptions = {
	/** Сегмент доступен только после заполнения всех предыдущих уровней цепочки. */
	selectionMode: "sequential";
	/** Явный metadata- или consumer-порядок сегментов одной цепочки. */
	segmentOrder: readonly string[];
};

export type UseODataDependentSelectionOptions = ODataDependentSelectionCommonOptions &
	(IndependentSelectionOptions | SequentialSelectionOptions);

export type ODataDependentSelectionModel = {
	/** Текущий общий снимок, который следует передавать каждому OData-контролу как `dependencies`. */
	values: ODataDependentSelectionValues;
	/** Публикует готовый общий снимок, сохраняя controlled/uncontrolled семантику hook. */
	updateValues: (values: ODataDependentSelectionValues) => void;
	/** Обновляет один сегмент и в sequential-режиме сбрасывает все последующие уровни. */
	updateSegment: (segmentId: string, value: readonly string[]) => void;
	/** Проверяет доступность сегмента относительно полного предшествующего пути цепочки. */
	isSegmentDisabled: (segmentId: string) => boolean;
};

function getSegmentIndex(segmentId: string, segmentOrder: readonly string[]) {
	return segmentOrder.indexOf(segmentId);
}

/**
 * Управляет общим снимком зависимых OData-сегментов без привязки к Select или MultiSelect.
 *
 * В sequential-режиме `segmentOrder` является источником истины для блокировки и
 * каскадного сброса. Если id отсутствует в порядке, сегмент блокируется: это
 * fail-closed поведение не позволяет незаметно обойти неправильно заданную цепочку.
 */
export function useODataDependentSelection({
	values,
	defaultValues,
	onChange,
	selectionMode = "independent",
	segmentOrder = []
}: UseODataDependentSelectionOptions): ODataDependentSelectionModel {
	const [uncontrolledValues, setUncontrolledValues] = useState<ODataDependentSelectionValues>(() => defaultValues ?? {});
	const resolvedValues = values ?? uncontrolledValues;

	const updateValues = useCallback(
		(nextValues: ODataDependentSelectionValues) => {
			if (values === undefined) {
				setUncontrolledValues(nextValues);
			}

			onChange?.(nextValues);
		},
		[onChange, values]
	);

	const isSegmentDisabled = useCallback(
		(segmentId: string) => {
			if (selectionMode === "independent") return false;

			const segmentIndex = getSegmentIndex(segmentId, segmentOrder);
			if (segmentIndex < 0) return true;

			return segmentOrder.slice(0, segmentIndex).some((previousSegmentId) => !resolvedValues[previousSegmentId]?.length);
		},
		[resolvedValues, segmentOrder, selectionMode]
	);

	const updateSegment = useCallback(
		(segmentId: string, nextSegmentValue: readonly string[]) => {
			if (isSegmentDisabled(segmentId)) return;

			const nextValues: ODataDependentSelectionValues = {
				...resolvedValues,
				[segmentId]: [...nextSegmentValue]
			};

			if (selectionMode === "sequential") {
				const segmentIndex = getSegmentIndex(segmentId, segmentOrder);

				// Смена родителя делает прежний downstream-путь недостоверным.
				for (const followingSegmentId of segmentOrder.slice(segmentIndex + 1)) {
					if (followingSegmentId in nextValues) {
						nextValues[followingSegmentId] = [];
					}
				}
			}

			updateValues(nextValues);
		},
		[isSegmentDisabled, resolvedValues, segmentOrder, selectionMode, updateValues]
	);

	return {
		values: resolvedValues,
		updateValues,
		updateSegment,
		isSegmentDisabled
	};
}
