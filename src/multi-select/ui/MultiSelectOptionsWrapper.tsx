import { type PropsWithChildren } from "react";

import { PickerStatus } from "../../picker";

import { MultiSelectOptionSkeleton } from "./MultiSelectOptionSkeleton";

type MultiSelectOptionsWrapperProps = PropsWithChildren<{
	isNoData?: boolean;
	error?: string;
}>;

/** Выбирает одно доступное состояние тела popup, не меняя структуру самого grid. */
export function MultiSelectOptionsWrapper({ isNoData, error, children }: MultiSelectOptionsWrapperProps) {
	if (isNoData) {
		return <PickerStatus emptyState={<MultiSelectOptionSkeleton text="Нет данных" />} />;
	}

	if (error) {
		return <PickerStatus errorState={<MultiSelectOptionSkeleton isError text="Ошибка загрузки" />} />;
	}

	return <>{children}</>;
}
