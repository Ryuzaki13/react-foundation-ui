import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { HighlightText } from "../text";
import uiStyles from "../ui.module.scss";

interface OptionContentProps {
	label: string;
	code?: string;
	highlight?: string;
	/** Приватный визуальный modifier label для специализированного владельца option. */
	labelClassName?: string;
	/** Отдельный modifier code, потому что code задаёт собственный variable-font weight. */
	codeClassName?: string;
}

/**
 * Универсальный рендерер опции. Используется и в single-select, и в multi-select.
 */
export function SelectOptionContent({ label, code, highlight, labelClassName, codeClassName }: OptionContentProps) {
	return (
		<div className={uiStyles.uiOptionBase}>
			<div className={cn(uiStyles.uiOptionText, "flexEllipsis", labelClassName)}>
				<HighlightText text={label} highlight={highlight} />
			</div>
			{code && (
				<div className={cn(uiStyles.uiOptionCode, codeClassName)}>
					<HighlightText text={code} highlight={highlight} />
				</div>
			)}
		</div>
	);
}
