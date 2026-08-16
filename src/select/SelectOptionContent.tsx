import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { OptionCode, OptionText } from "../option";
import { HighlightText } from "../text";

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
		<>
			<OptionText className={cn("flexEllipsis", labelClassName)}>
				<HighlightText text={label} highlight={highlight} />
			</OptionText>
			{code && (
				<OptionCode className={codeClassName}>
					<HighlightText text={code} highlight={highlight} />
				</OptionCode>
			)}
		</>
	);
}
