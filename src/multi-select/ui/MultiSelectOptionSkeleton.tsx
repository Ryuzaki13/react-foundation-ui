import { Text } from "../../text";
import uiStyles from "../../ui.module.scss";

interface MultiSelectOptionSkeletonProps {
	text: string;
	isError?: boolean;
}

/**
 * Скелетон строки опции для `MultiSelect`. Используется во время загрузки или при отображении ошибок получения списка.
 */
export function MultiSelectOptionSkeleton({ text, isError }: MultiSelectOptionSkeletonProps) {
	return (
		<div className={uiStyles.uiPopupOption}>
			<span className={uiStyles.uiPopupOptionIcon}></span>
			<Text color={isError ? "error" : "primary"}>{text}</Text>
		</div>
	);
}
